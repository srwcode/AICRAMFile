package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Assessment struct {
	ID              primitive.ObjectID `bson:"_id"`
	Assessment_id   string             `json:"assessment_id"`
	User_id         *string            `json:"user_id"`
	Name            *string            `json:"name" validate:"required,min=2,max=100"`
	Status          *int               `json:"status" validate:"required,eq=1|eq=2"`
	Matrix_id       *string            `json:"matrix_id"`
	Organization_id *string            `json:"organization_id"`
	Situation       *string            `json:"situation" validate:"required"`
	Asset           []*string          `json:"asset"`
	Threat          []*string          `json:"threat"`
	Constraint      *string            `json:"constraint"`
	Created_at      time.Time          `json:"created_at"`
	Updated_at      time.Time          `json:"updated_at"`
}
