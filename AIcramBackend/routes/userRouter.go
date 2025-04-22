package routes

import (
	"user-athentication-golang/controllers"
	controller "user-athentication-golang/controllers"
	"user-athentication-golang/middleware"

	"github.com/gin-gonic/gin"
)

func UserRoutes(incomingRoutes *gin.Engine) {
	incomingRoutes.Use(middleware.Authentication())

	incomingRoutes.GET("/users/me", controller.GetCurrentUser())
	incomingRoutes.GET("/auth/verify", controller.VerifyAdmin())
	incomingRoutes.GET("/auth/data", controller.GetCurrentUserData())

	incomingRoutes.GET("/users", controller.GetUsers())
	incomingRoutes.GET("/users/:user_id", controller.GetUser())
	incomingRoutes.POST("/users", controller.CreateUser())
	incomingRoutes.PUT("/users/:user_id", controller.UpdateUser())
	incomingRoutes.DELETE("/users/:user_id", controller.DeleteUser())
	incomingRoutes.GET("/users/username", controller.GetUsernameByID())
	incomingRoutes.PUT("/users/:user_id/password", controllers.UpdatePassword())

	incomingRoutes.POST("/upload", controllers.UploadFile())
	incomingRoutes.GET("/files", controller.GetFiles())
	incomingRoutes.GET("/files/:file_id", controllers.GetFile())
	incomingRoutes.DELETE("/files/:file_id", controller.DeleteFile())

	incomingRoutes.GET("/matrices", controller.GetMatrices())
	incomingRoutes.GET("/matrices/:matrix_id", controller.GetMatrix())
	incomingRoutes.POST("/matrices", controller.CreateMatrix())
	incomingRoutes.PUT("/matrices/:matrix_id", controller.UpdateMatrix())
	incomingRoutes.DELETE("/matrices/:matrix_id", controller.DeleteMatrix())
	incomingRoutes.POST("/matrices/remove/:matrix_id", controller.RemoveMatrix())

	incomingRoutes.GET("/assessments", controller.GetAssessments())
	incomingRoutes.GET("/assessments/:assessment_id", controller.GetAssessment())
	incomingRoutes.POST("/assessments", controller.CreateAssessment())
	incomingRoutes.PUT("/assessments/:assessment_id", controller.UpdateAssessment())
	incomingRoutes.DELETE("/assessments/:assessment_id", controller.DeleteAssessment())
	incomingRoutes.POST("/assessments/remove/:assessment_id", controller.RemoveAssessment())

	incomingRoutes.GET("/organizations", controller.GetOrganizations())
	incomingRoutes.GET("/organizations/:organization_id", controller.GetOrganization())
	incomingRoutes.POST("/organizations", controller.CreateOrganization())
	incomingRoutes.PUT("/organizations/:organization_id", controller.UpdateOrganization())
	incomingRoutes.DELETE("/organizations/:organization_id", controller.DeleteOrganization())
	incomingRoutes.POST("/organizations/remove/:organization_id", controller.RemoveOrganization())

	incomingRoutes.GET("/results", controller.GetResults())
	incomingRoutes.GET("/results/:result_id", controller.GetResult())
	incomingRoutes.POST("/results", controller.CreateResult())
	incomingRoutes.PUT("/results/:result_id", controller.UpdateResult())
	incomingRoutes.DELETE("/results/:result_id", controller.DeleteResult())
	incomingRoutes.POST("/results/remove/:result_id", controller.RemoveResult())
	incomingRoutes.POST("/results/contents", controllers.CreateContent())
}
