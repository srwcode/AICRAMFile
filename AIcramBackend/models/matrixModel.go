package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Matrix struct {
	ID           primitive.ObjectID `bson:"_id"`
	Matrix_id    string             `json:"matrix_id"`
	User_id      *string            `json:"user_id"`
	Name         *string            `json:"name" validate:"required,min=2,max=100"`
	Status       *int               `json:"status" validate:"required,eq=1|eq=2"`
	Type         *int               `json:"type" validate:"required,eq=1|eq=2|eq=3"`
	Description  *string            `json:"description" validate:"max=1000"`
	Impact_1     *string            `json:"impact_1" validate:"max=1000"`
	Impact_2     *string            `json:"impact_2" validate:"max=1000"`
	Impact_3     *string            `json:"impact_3" validate:"max=1000"`
	Impact_4     *string            `json:"impact_4" validate:"max=1000"`
	Impact_5     *string            `json:"impact_5" validate:"max=1000"`
	Likelihood_1 *string            `json:"likelihood_1" validate:"max=1000"`
	Likelihood_2 *string            `json:"likelihood_2" validate:"max=1000"`
	Likelihood_3 *string            `json:"likelihood_3" validate:"max=1000"`
	Likelihood_4 *string            `json:"likelihood_4" validate:"max=1000"`
	Likelihood_5 *string            `json:"likelihood_5" validate:"max=1000"`
	Created_at   time.Time          `json:"created_at"`
	Updated_at   time.Time          `json:"updated_at"`
}
