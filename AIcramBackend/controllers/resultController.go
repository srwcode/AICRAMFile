package controllers

import (
	"context"
	"encoding/json"
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

var resultCollection *mongo.Collection = database.OpenCollection(database.Client, "result")
var resultValidate = validator.New()

func GetResults() gin.HandlerFunc {
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

		assessmentId := c.Query("assessment_id")

		matchCriteria := bson.D{}

		if userType != "ADMIN" {
			matchCriteria = append(matchCriteria, bson.E{"user_id", userId})
			matchCriteria = append(matchCriteria, bson.E{Key: "status", Value: bson.M{"$in": []int{1, 2}}})
		} else {
			queryUserId := c.Query("user_id")
			if queryUserId != "" {
				matchCriteria = append(matchCriteria, bson.E{"user_id", queryUserId})
			}
		}

		if assessmentId != "" {
			matchCriteria = append(matchCriteria, bson.E{"assessment_id", assessmentId})
		}

		var matchStage bson.D
		if len(matchCriteria) > 0 {
			matchStage = bson.D{{"$match", matchCriteria}}
		} else {
			matchStage = bson.D{{"$match", bson.D{{}}}}
		}

		sortStage := bson.D{{"$sort", bson.D{{"created_at", -1}}}}
		groupStage := bson.D{{"$group", bson.D{{"_id", bson.D{{"_id", "null"}}}, {"total_count", bson.D{{"$sum", 1}}}, {"data", bson.D{{"$push", "$$ROOT"}}}}}}
		projectStage := bson.D{
			{"$project", bson.D{
				{"_id", 0},
				{"total_count", 1},
				{"result_items", bson.D{{"$slice", []interface{}{"$data", startIndex, recordPerPage}}}},
			}}}

		result, err := resultCollection.Aggregate(ctx, mongo.Pipeline{
			matchStage, sortStage, groupStage, projectStage})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while listing result items"})
			return
		}

		var allresults []bson.M
		if err = result.All(ctx, &allresults); err != nil {
			log.Fatal(err)
		}

		if len(allresults) == 0 {
			c.JSON(http.StatusOK, gin.H{
				"total_count":  0,
				"result_items": []bson.M{},
			})
			return
		}

		c.JSON(http.StatusOK, allresults[0])
	}
}

func GetResult() gin.HandlerFunc {
	return func(c *gin.Context) {
		resultId := c.Param("result_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var result models.Result
		err := resultCollection.FindOne(ctx, bson.M{"result_id": resultId}).Decode(&result)
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

		if userType != "ADMIN" {
			if *result.User_id != userId.(string) || (result.Status != nil && *result.Status != 1 && *result.Status != 2) {
				c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized to view this result"})
				return
			}
		}

		c.JSON(http.StatusOK, result)
	}
}

func CreateResult() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var result models.Result

		if err := c.BindJSON(&result); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		validationErr := resultValidate.Struct(result)
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
			result.User_id = &userIdStr
		} else {
			var user models.User
			err := userCollection.FindOne(context.TODO(), bson.M{"username": result.User_id}).Decode(&user)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "user_error"})
				return
			}
			if user.Username == nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "user_error"})
				return
			}
			userID := user.ID.Hex()
			result.User_id = &userID
		}

		if result.Assessment_id != nil && *result.Assessment_id != "" {
			var assessment models.Assessment
			errAssessment := assessmentCollection.FindOne(context.TODO(), bson.M{"assessment_id": result.Assessment_id}).Decode(&assessment)
			defer cancel()
			if errAssessment != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "assessment_error"})
				return
			}
			if assessment.Assessment_id == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "assessment_error"})
				return
			}
		}

		if result.Status == nil {
			status := 1
			result.Status = &status
		}

		result.Created_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		result.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		result.ID = primitive.NewObjectID()
		result.Result_id = result.ID.Hex()

		_, insertErr := resultCollection.InsertOne(ctx, result)
		if insertErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create result"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"result_id": result.Result_id})
	}
}

func UpdateResult() gin.HandlerFunc {
	return func(c *gin.Context) {
		resultId := c.Param("result_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var existingResult models.Result
		err := resultCollection.FindOne(ctx, bson.M{"result_id": resultId}).Decode(&existingResult)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "result not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while fetching result"})
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
			if *existingResult.User_id != userId.(string) || (existingResult.Status != nil && *existingResult.Status != 1) {
				c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized to update this result"})
				return
			}
		}

		var updateData models.Result
		if err := c.BindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if updateData.Assessment_id != nil && *updateData.Assessment_id != "" {
			var assessment models.Assessment
			errAssessment := assessmentCollection.FindOne(context.TODO(), bson.M{"assessment_id": updateData.Assessment_id}).Decode(&assessment)
			defer cancel()
			if errAssessment != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "assessment_error"})
				return
			}
			if assessment.Assessment_id == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "assessment_error"})
				return
			}
		}

		update := bson.M{}

		if userType != "ADMIN" {
			updateData.User_id = nil
			updateData.Status = nil
		}

		if updateData.Status != nil && userType == "ADMIN" {
			update["status"] = updateData.Status
		}
		if updateData.Assessment_id != nil {
			update["assessment_id"] = updateData.Assessment_id
		}
		if updateData.Content != nil {
			update["content"] = updateData.Content
		}

		update["updated_at"] = time.Now().Format(time.RFC3339)

		result, err := resultCollection.UpdateOne(
			ctx,
			bson.M{"result_id": resultId},
			bson.M{"$set": update},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update result"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "result not found"})
			return
		}

		c.JSON(http.StatusOK, result.ModifiedCount)
	}
}

func DeleteResult() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helper.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		resultId := c.Param("result_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		result, err := resultCollection.DeleteOne(ctx, bson.M{"result_id": resultId})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete result"})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}

func RemoveResult() gin.HandlerFunc {
	return func(c *gin.Context) {
		resultId := c.Param("result_id")
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var existingResult models.Result
		err := resultCollection.FindOne(ctx, bson.M{"result_id": resultId}).Decode(&existingResult)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "result not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while fetching result"})
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
			if *existingResult.User_id != userId.(string) || (existingResult.Status != nil && *existingResult.Status != 1) {
				c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized to remove this result"})
				return
			}
		}

		status := 3
		update := bson.M{
			"status":     status,
			"updated_at": time.Now().Format(time.RFC3339),
		}

		result, err := resultCollection.UpdateOne(
			ctx,
			bson.M{"result_id": resultId},
			bson.M{"$set": update},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove result"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "result not found"})
			return
		}

		c.JSON(http.StatusOK, result.ModifiedCount)
	}
}

func CreateContent() gin.HandlerFunc {
	return func(c *gin.Context) {
		var _, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		body, err := c.GetRawData()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
			return
		}

		var prettyJSON []byte
		prettyJSON, err = json.MarshalIndent(json.RawMessage(body), "", "  ")
		if err != nil {
			log.Printf("Error formatting JSON: %s", err)
		} else {
			log.Printf("\n\nData input:\n\n%s\n\n", string(prettyJSON))
		}

		time.Sleep(10 * time.Second)

		response := gin.H{
			"success":       2,
			"vulnerability": []string{},
			"summary":       "",
			"message":       "No response from AI",
		}

		c.JSON(http.StatusOK, response)
	}
}
