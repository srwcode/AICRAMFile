package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Content struct {
	Success       *int             `json:"success" validate:"eq=1|eq=2"`
	Vulnerability []*Vulnerability `json:"vulnerability"`
	Summary       *string          `json:"summary"`
	Message       *string          `json:"message"`
}

type Vulnerability struct {
	Name           *string    `json:"name"`
	Description    *string    `json:"description"`
	CVE            []*string  `json:"cve"`
	MITRE          []*string  `json:"mitre"`
	Impact         *int       `json:"impact" validate:"eq=0|eq=1|eq=2|eq=3|eq=4|eq=5"`
	Likelihood     *int       `json:"likelihood" validate:"eq=0|eq=1|eq=2|eq=3|eq=4|eq=5"`
	New_impact     *int       `json:"new_impact" validate:"eq=0|eq=1|eq=2|eq=3|eq=4|eq=5"`
	New_likelihood *int       `json:"new_likelihood" validate:"eq=0|eq=1|eq=2|eq=3|eq=4|eq=5"`
	Control        []*Control `json:"control"`
}

type Control struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	NIST        *string `json:"nist"`
	ISO         *string `json:"iso"`
}

type Result struct {
	ID            primitive.ObjectID `bson:"_id"`
	Result_id     string             `json:"result_id"`
	User_id       *string            `json:"user_id"`
	Status        *int               `json:"status" validate:"required,eq=1|eq=2|eq=3"`
	Assessment_id *string            `json:"assessment_id"`
	Content       *Content           `json:"content"`
	Created_at    time.Time          `json:"created_at"`
	Updated_at    time.Time          `json:"updated_at"`
}
