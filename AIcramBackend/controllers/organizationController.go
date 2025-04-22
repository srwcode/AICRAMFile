package controllers

import (
	"context"
	"log"
	"strconv"

	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"user-athentication-golang/database"

	helper "user-athentication-golang/helpers"
	"user-athentication-golang/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var organizationCollection *mongo.Collection = database.OpenCollection(database.Client, "organization")
var organizationValidate = validator.New()

func GetOrganizations() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		recordPerPage, err := strconv.Atoi(c.Query("recordPerPage"))
		if err != nil || recordPerPage < 1 {
			recordPerPage = 10
		}

		page, err1 := strconv.Atoi(c.Query("page"))
		if err1 != nil || page < 1 {
			page = 1
		}

		startIndex := (page - 1) * recordPerPage
		startIndex, err = strconv.Atoi(c.Query("startIndex"))

		userId, exists := c.Get("uid")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user id not found in context"})
			return
		}

		userType, exists := c.Get("user_type")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user type not found in context"})
			return
		}

		var matchStage bson.D
		if userType == "ADMIN" {
			queryUserId := c.Query("user_id")
			if queryUserId != "" {
				matchStage = bson.D{{"$match", bson.D{{"user_id", queryUserId}}}}
			} else {
				matchStage = bson.D{{"$match", bson.D{{}}}}
			}
		} else {
			matchStage = bson.D{{"$match", bson.D{
				{"user_id", userId},
				{"status", 1},
			}}}
		}

		sortStage := bson.D{{"$sort", bson.D{{"created_at", -1}}}}
		groupStage := bson.D{{"$group", bson.D{{"_id", bson.D{{"_id", "null"}}}, {"total_count", bson.D{{"$sum", 1}}}, {"data", bson.D{{"$push", "$$ROOT"}}}}}}
		projectStage := bson.D{
			{"$project", bson.D{
				{"_id", 0},
				{"total_count", 1},
				{"organization_items", bson.D{{"$slice", []interface{}{"$data", startIndex, recordPerPage}}}},
			}}}

		result, err := organizationCollection.Aggregate(ctx, mongo.Pipeline{
			matchStage, sortStage, groupStage, projectStage})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while listing organization items"})
			return
		}

		var allorganizations []bson.M
		if err = result.All(ctx, &allorganizations); err != nil {
			log.Fatal(err)
		}

		if len(allorganizations) == 0 {
			c.JSON(http.StatusOK, gin.H{
				"total_count":        0,
				"organization_items": []bson.M{},
			})
			return
		}

		c.JSON(http.StatusOK, allorganizations[0])
	}
}

func GetOrganization() gin.HandlerFunc {
	return func(c *gin.Context) {
		organizationId := c.Param("organization_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var organization models.Organization
		err := organizationCollection.FindOne(ctx, bson.M{"organization_id": organizationId}).Decode(&organization)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		userId, exists := c.Get("uid")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user id not found in context"})
			return
		}

		userType, exists := c.Get("user_type")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user type not found in context"})
			return
		}

		transactionParam := c.Query("transaction")

		if userType != "ADMIN" {
			if (*organization.User_id != userId.(string) && transactionParam != "true") || (organization.Status != nil && *organization.Status != 1) {
				c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized to view this organization"})
				return
			}
		}

		c.JSON(http.StatusOK, organization)
	}
}

func CreateOrganization() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var organization models.Organization

		if err := c.BindJSON(&organization); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		validationErr := organizationValidate.Struct(organization)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
			return
		}

		userType, exists := c.Get("user_type")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user type not found in context"})
			return
		}

		userId, exists := c.Get("uid")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user id not found in context"})
			return
		}

		if userType != "ADMIN" {
			userIdStr := userId.(string)
			organization.User_id = &userIdStr
		} else {
			var user models.User
			err := userCollection.FindOne(context.TODO(), bson.M{"username": organization.User_id}).Decode(&user)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "user_error"})
				return
			}
			if user.Username == nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "user_error"})
				return
			}
			userID := user.ID.Hex()
			organization.User_id = &userID
		}

		if organization.Status == nil {
			status := 1
			organization.Status = &status
		}

		organization.Created_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		organization.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		organization.ID = primitive.NewObjectID()
		organization.Organization_id = organization.ID.Hex()

		resultInsertionNumber, insertErr := organizationCollection.InsertOne(ctx, organization)
		if insertErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create organization"})
			return
		}

		c.JSON(http.StatusOK, resultInsertionNumber)
	}
}

func UpdateOrganization() gin.HandlerFunc {
	return func(c *gin.Context) {
		organizationId := c.Param("organization_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var existingOrganization models.Organization
		err := organizationCollection.FindOne(ctx, bson.M{"organization_id": organizationId}).Decode(&existingOrganization)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "organization not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while fetching organization"})
			return
		}

		userType, exists := c.Get("user_type")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user type not found in context"})
			return
		}

		userId, exists := c.Get("uid")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user id not found in context"})
			return
		}

		if userType != "ADMIN" {
			if *existingOrganization.User_id != userId.(string) || (existingOrganization.Status != nil && *existingOrganization.Status != 1) {
				c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized to update this organization"})
				return
			}
		}

		var updateData models.Organization
		if err := c.BindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		update := bson.M{}

		if userType != "ADMIN" {
			updateData.User_id = nil
			updateData.Status = nil
		}

		if updateData.Name != nil {
			update["name"] = updateData.Name
		}
		if updateData.Status != nil && userType == "ADMIN" {
			update["status"] = updateData.Status
		}
		if updateData.Description != nil {
			update["description"] = updateData.Description
		}
		if updateData.Industry != nil {
			update["industry"] = updateData.Industry
		}
		if updateData.Employees != nil {
			update["employees"] = updateData.Employees
		}
		if updateData.Customers != nil {
			update["customers"] = updateData.Customers
		}
		if updateData.Revenue != nil {
			update["revenue"] = updateData.Revenue
		}
		if updateData.Country != nil {
			update["country"] = updateData.Country
		}
		if updateData.Regulation != nil {
			update["regulation"] = updateData.Regulation
		}
		if updateData.Asset != nil {
			update["asset"] = updateData.Asset
		}
		if updateData.Structure != nil {
			update["structure"] = updateData.Structure
		}
		if updateData.Architecture != nil {
			update["architecture"] = updateData.Architecture
		}
		if updateData.Measure != nil {
			update["measure"] = updateData.Measure
		}
		if updateData.Constraint != nil {
			update["constraint"] = updateData.Constraint
		}

		update["updated_at"] = time.Now().Format(time.RFC3339)

		result, err := organizationCollection.UpdateOne(
			ctx,
			bson.M{"organization_id": organizationId},
			bson.M{"$set": update},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update organization"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "organization not found"})
			return
		}

		c.JSON(http.StatusOK, result.ModifiedCount)
	}
}

func DeleteOrganization() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helper.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		organizationId := c.Param("organization_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		result, err := organizationCollection.DeleteOne(ctx, bson.M{"organization_id": organizationId})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete organization"})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}

func RemoveOrganization() gin.HandlerFunc {
	return func(c *gin.Context) {
		organizationId := c.Param("organization_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var existingOrganization models.Organization
		err := organizationCollection.FindOne(ctx, bson.M{"organization_id": organizationId}).Decode(&existingOrganization)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "organization not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while fetching organization"})
			return
		}

		userType, exists := c.Get("user_type")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user type not found in context"})
			return
		}

		userId, exists := c.Get("uid")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user id not found in context"})
			return
		}

		if userType != "ADMIN" {
			if *existingOrganization.User_id != userId.(string) || (existingOrganization.Status != nil && *existingOrganization.Status != 1) {
				c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized to remove this organization"})
				return
			}
		}

		status := 2
		update := bson.M{
			"status":     status,
			"updated_at": time.Now().Format(time.RFC3339),
		}

		result, err := organizationCollection.UpdateOne(
			ctx,
			bson.M{"organization_id": organizationId},
			bson.M{"$set": update},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove organization"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "organization not found"})
			return
		}

		c.JSON(http.StatusOK, result.ModifiedCount)
	}
}
