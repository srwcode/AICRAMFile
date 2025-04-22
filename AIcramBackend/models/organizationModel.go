package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Asset struct {
	Name        *string  `json:"name"`
	Value       *float64 `json:"value"`
	Criticality *int     `json:"criticality" validate:"required,eq=1|eq=2|eq=3|eq=4|eq=5"`
}

type Organization struct {
	ID              primitive.ObjectID `bson:"_id"`
	Organization_id string             `json:"organization_id"`
	User_id         *string            `json:"user_id"`
	Name            *string            `json:"name" validate:"required,min=2,max=100"`
	Status          *int               `json:"status" validate:"required,eq=1|eq=2"`
	Description     *string            `json:"description" validate:"max=1000"`
	Industry        *string            `json:"industry" validate:"required"`
	Employees       *int               `json:"employees"`
	Customers       *int               `json:"customers"`
	Revenue         *float64           `json:"revenue"`
	Country         *string            `json:"country" validate:"required,max=100"`
	Regulation      []*string          `json:"regulation"`
	Asset           []*Asset           `json:"asset"`
	Structure       *string            `json:"structure"`
	Architecture    *string            `json:"architecture"`
	Measure         *string            `json:"measure"`
	Constraint      *string            `json:"constraint"`
	Created_at      time.Time          `json:"created_at"`
	Updated_at      time.Time          `json:"updated_at"`
}
