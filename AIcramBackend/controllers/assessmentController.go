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

var assessmentCollection *mongo.Collection = database.OpenCollection(database.Client, "assessment")
var assessmentValidate = validator.New()

func GetAssessments() gin.HandlerFunc {
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
				{"assessment_items", bson.D{{"$slice", []interface{}{"$data", startIndex, recordPerPage}}}},
			}}}

		result, err := assessmentCollection.Aggregate(ctx, mongo.Pipeline{
			matchStage, sortStage, groupStage, projectStage})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while listing assessment items"})
			return
		}

		var allassessments []bson.M
		if err = result.All(ctx, &allassessments); err != nil {
			log.Fatal(err)
		}

		if len(allassessments) == 0 {
			c.JSON(http.StatusOK, gin.H{
				"total_count":      0,
				"assessment_items": []bson.M{},
			})
			return
		}

		c.JSON(http.StatusOK, allassessments[0])
	}
}

func GetAssessment() gin.HandlerFunc {
	return func(c *gin.Context) {
		assessmentId := c.Param("assessment_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var assessment models.Assessment
		err := assessmentCollection.FindOne(ctx, bson.M{"assessment_id": assessmentId}).Decode(&assessment)
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
			if (*assessment.User_id != userId.(string) && transactionParam != "true") || (assessment.Status != nil && *assessment.Status != 1) {
				c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized to view this assessment"})
				return
			}
		}

		c.JSON(http.StatusOK, assessment)
	}
}

func CreateAssessment() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var assessment models.Assessment

		if err := c.BindJSON(&assessment); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		validationErr := assessmentValidate.Struct(assessment)
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
			assessment.User_id = &userIdStr
		} else {
			var user models.User
			err := userCollection.FindOne(context.TODO(), bson.M{"username": assessment.User_id}).Decode(&user)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "user_error"})
				return
			}
			if user.Username == nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "user_error"})
				return
			}
			userID := user.ID.Hex()
			assessment.User_id = &userID
		}

		if assessment.Matrix_id != nil && *assessment.Matrix_id != "" {
			var matrix models.Matrix
			errMatrix := matrixCollection.FindOne(context.TODO(), bson.M{"matrix_id": assessment.Matrix_id}).Decode(&matrix)
			defer cancel()
			if errMatrix != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "matrix_error"})
				return
			}
			if matrix.Matrix_id == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "matrix_error"})
				return
			}
		}

		if assessment.Organization_id != nil && *assessment.Organization_id != "" {
			var organization models.Organization
			errOrganization := organizationCollection.FindOne(context.TODO(), bson.M{"organization_id": assessment.Organization_id}).Decode(&organization)
			defer cancel()
			if errOrganization != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "organization_error"})
				return
			}
			if organization.Organization_id == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "organization_error"})
				return
			}
		}

		if assessment.Status == nil {
			status := 1
			assessment.Status = &status
		}

		assessment.Created_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		assessment.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		assessment.ID = primitive.NewObjectID()
		assessment.Assessment_id = assessment.ID.Hex()

		_, insertErr := assessmentCollection.InsertOne(ctx, assessment)
		if insertErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create assessment"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"assessment_id": assessment.Assessment_id})
	}
}

func UpdateAssessment() gin.HandlerFunc {
	return func(c *gin.Context) {
		assessmentId := c.Param("assessment_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var existingAssessment models.Assessment
		err := assessmentCollection.FindOne(ctx, bson.M{"assessment_id": assessmentId}).Decode(&existingAssessment)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "assessment not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while fetching assessment"})
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
			if *existingAssessment.User_id != userId.(string) || (existingAssessment.Status != nil && *existingAssessment.Status != 1) {
				c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized to update this assessment"})
				return
			}
		}

		var updateData models.Assessment
		if err := c.BindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if updateData.Matrix_id != nil && *updateData.Matrix_id != "" {
			var matrix models.Matrix
			errMatrix := matrixCollection.FindOne(context.TODO(), bson.M{"matrix_id": updateData.Matrix_id}).Decode(&matrix)
			defer cancel()
			if errMatrix != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "matrix_error"})
				return
			}
			if matrix.Matrix_id == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "matrix_error"})
				return
			}
		}

		if updateData.Organization_id != nil && *updateData.Organization_id != "" {
			var organization models.Organization
			errOrganization := organizationCollection.FindOne(context.TODO(), bson.M{"organization_id": updateData.Organization_id}).Decode(&organization)
			defer cancel()
			if errOrganization != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "organization_error"})
				return
			}
			if organization.Organization_id == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "organization_error"})
				return
			}
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
		if updateData.Matrix_id != nil {
			update["matrix_id"] = updateData.Matrix_id
		}
		if updateData.Organization_id != nil {
			update["organization_id"] = updateData.Organization_id
		}
		if updateData.Situation != nil {
			update["situation"] = updateData.Situation
		}
		if updateData.Asset != nil {
			update["asset"] = updateData.Asset
		}
		if updateData.Threat != nil {
			update["threat"] = updateData.Threat
		}
		if updateData.Constraint != nil {
			update["constraint"] = updateData.Constraint
		}

		update["updated_at"] = time.Now().Format(time.RFC3339)

		result, err := assessmentCollection.UpdateOne(
			ctx,
			bson.M{"assessment_id": assessmentId},
			bson.M{"$set": update},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update assessment"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "assessment not found"})
			return
		}

		c.JSON(http.StatusOK, result.ModifiedCount)
	}
}

func DeleteAssessment() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helper.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		assessmentId := c.Param("assessment_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		result, err := assessmentCollection.DeleteOne(ctx, bson.M{"assessment_id": assessmentId})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete assessment"})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}

func RemoveAssessment() gin.HandlerFunc {
	return func(c *gin.Context) {
		assessmentId := c.Param("assessment_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var existingAssessment models.Assessment
		err := assessmentCollection.FindOne(ctx, bson.M{"assessment_id": assessmentId}).Decode(&existingAssessment)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "assessment not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while fetching assessment"})
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
			if *existingAssessment.User_id != userId.(string) || (existingAssessment.Status != nil && *existingAssessment.Status != 1) {
				c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized to remove this assessment"})
				return
			}
		}

		status := 2
		update := bson.M{
			"status":     status,
			"updated_at": time.Now().Format(time.RFC3339),
		}

		result, err := assessmentCollection.UpdateOne(
			ctx,
			bson.M{"assessment_id": assessmentId},
			bson.M{"$set": update},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove assessment"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "assessment not found"})
			return
		}

		resultStatus := 3
		resultUpdate := bson.M{
			"status":     resultStatus,
			"updated_at": time.Now().Format(time.RFC3339),
		}

		resultUpdateResult, resultUpdateErr := resultCollection.UpdateMany(
			ctx,
			bson.M{"assessment_id": assessmentId},
			bson.M{"$set": resultUpdate},
		)

		if resultUpdateErr != nil {
			log.Printf("Failed to update related results: %v", resultUpdateErr)
		}

		c.JSON(http.StatusOK, gin.H{
			"assessment_modified": result.ModifiedCount,
			"results_modified":    resultUpdateResult.ModifiedCount,
		})
	}
}
