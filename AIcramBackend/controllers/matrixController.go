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

var matrixCollection *mongo.Collection = database.OpenCollection(database.Client, "matrix")
var matrixValidate = validator.New()

func GetMatrices() gin.HandlerFunc {
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
				{"matrix_items", bson.D{{"$slice", []interface{}{"$data", startIndex, recordPerPage}}}},
			}}}

		result, err := matrixCollection.Aggregate(ctx, mongo.Pipeline{
			matchStage, sortStage, groupStage, projectStage})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while listing matrix items"})
			return
		}

		var allmatrices []bson.M
		if err = result.All(ctx, &allmatrices); err != nil {
			log.Fatal(err)
		}

		if len(allmatrices) == 0 {
			c.JSON(http.StatusOK, gin.H{
				"total_count":  0,
				"matrix_items": []bson.M{},
			})
			return
		}

		c.JSON(http.StatusOK, allmatrices[0])
	}
}

func GetMatrix() gin.HandlerFunc {
	return func(c *gin.Context) {
		matrixId := c.Param("matrix_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var matrix models.Matrix
		err := matrixCollection.FindOne(ctx, bson.M{"matrix_id": matrixId}).Decode(&matrix)
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
			if (*matrix.User_id != userId.(string) && transactionParam != "true") || (matrix.Status != nil && *matrix.Status != 1) {
				c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized to view this matrix"})
				return
			}
		}

		c.JSON(http.StatusOK, matrix)
	}
}

func CreateMatrix() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var matrix models.Matrix

		if err := c.BindJSON(&matrix); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		validationErr := matrixValidate.Struct(matrix)
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
			matrix.User_id = &userIdStr
		} else {
			var user models.User
			err := userCollection.FindOne(context.TODO(), bson.M{"username": matrix.User_id}).Decode(&user)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "user_error"})
				return
			}
			if user.Username == nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "user_error"})
				return
			}
			userID := user.ID.Hex()
			matrix.User_id = &userID
		}

		if matrix.Status == nil {
			status := 1
			matrix.Status = &status
		}

		matrix.Created_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		matrix.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		matrix.ID = primitive.NewObjectID()
		matrix.Matrix_id = matrix.ID.Hex()

		resultInsertionNumber, insertErr := matrixCollection.InsertOne(ctx, matrix)
		if insertErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create matrix"})
			return
		}

		c.JSON(http.StatusOK, resultInsertionNumber)
	}
}

func UpdateMatrix() gin.HandlerFunc {
	return func(c *gin.Context) {
		matrixId := c.Param("matrix_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var existingMatrix models.Matrix
		err := matrixCollection.FindOne(ctx, bson.M{"matrix_id": matrixId}).Decode(&existingMatrix)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "matrix not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while fetching matrix"})
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
			if *existingMatrix.User_id != userId.(string) || (existingMatrix.Status != nil && *existingMatrix.Status != 1) {
				c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized to update this matrix"})
				return
			}
		}

		var updateData models.Matrix
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
		if updateData.Type != nil {
			update["type"] = updateData.Type
		}
		if updateData.Description != nil {
			update["description"] = updateData.Description
		}
		if updateData.Impact_1 != nil {
			update["impact_1"] = updateData.Impact_1
		}
		if updateData.Impact_2 != nil {
			update["impact_2"] = updateData.Impact_2
		}
		if updateData.Impact_3 != nil {
			update["impact_3"] = updateData.Impact_3
		}
		if updateData.Impact_4 != nil {
			update["impact_4"] = updateData.Impact_4
		}
		if updateData.Impact_5 != nil {
			update["impact_5"] = updateData.Impact_5
		}
		if updateData.Likelihood_1 != nil {
			update["likelihood_1"] = updateData.Likelihood_1
		}
		if updateData.Likelihood_2 != nil {
			update["likelihood_2"] = updateData.Likelihood_2
		}
		if updateData.Likelihood_3 != nil {
			update["likelihood_3"] = updateData.Likelihood_3
		}
		if updateData.Likelihood_4 != nil {
			update["likelihood_4"] = updateData.Likelihood_4
		}
		if updateData.Likelihood_5 != nil {
			update["likelihood_5"] = updateData.Likelihood_5
		}

		update["updated_at"] = time.Now().Format(time.RFC3339)

		result, err := matrixCollection.UpdateOne(
			ctx,
			bson.M{"matrix_id": matrixId},
			bson.M{"$set": update},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update matrix"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "matrix not found"})
			return
		}

		c.JSON(http.StatusOK, result.ModifiedCount)
	}
}

func DeleteMatrix() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helper.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		matrixId := c.Param("matrix_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		result, err := matrixCollection.DeleteOne(ctx, bson.M{"matrix_id": matrixId})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete matrix"})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}

func RemoveMatrix() gin.HandlerFunc {
	return func(c *gin.Context) {
		matrixId := c.Param("matrix_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var existingMatrix models.Matrix
		err := matrixCollection.FindOne(ctx, bson.M{"matrix_id": matrixId}).Decode(&existingMatrix)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "matrix not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while fetching matrix"})
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
			if *existingMatrix.User_id != userId.(string) || (existingMatrix.Status != nil && *existingMatrix.Status != 1) {
				c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized to remove this matrix"})
				return
			}
		}

		status := 2
		update := bson.M{
			"status":     status,
			"updated_at": time.Now().Format(time.RFC3339),
		}

		result, err := matrixCollection.UpdateOne(
			ctx,
			bson.M{"matrix_id": matrixId},
			bson.M{"$set": update},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove matrix"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "matrix not found"})
			return
		}

		c.JSON(http.StatusOK, result.ModifiedCount)
	}
}
