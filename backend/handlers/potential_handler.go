
package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
)

// PotentialHandler handles potential-related requests
type PotentialHandler struct {
	Repo repositories.PotentialRepository
}

// NewPotentialHandler creates a new PotentialHandler
func NewPotentialHandler(repo repositories.PotentialRepository) *PotentialHandler {
	return &PotentialHandler{Repo: repo}
}

// GetAllPotentials retrieves all potentials
func (h *PotentialHandler) GetAllPotentials(c *gin.Context) {
	potentials, err := h.Repo.GetAllPotentials()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve potentials"})
		return
	}

	c.JSON(http.StatusOK, potentials)
}

// CreatePotential creates a new potential
func (h *PotentialHandler) CreatePotential(c *gin.Context) {
	var potential models.Potential
	if err := c.ShouldBindJSON(&potential); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.Repo.CreatePotential(&potential); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, potential)
}

// UpdatePotential updates an existing potential
func (h *PotentialHandler) UpdatePotential(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	var potential models.Potential
	if err := c.ShouldBindJSON(&potential); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	potential.ID = id
	if err := h.Repo.UpdatePotential(&potential); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, potential)
}

// DeletePotential deletes a potential
func (h *PotentialHandler) DeletePotential(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := h.Repo.DeletePotential(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
