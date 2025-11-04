
package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
)

type ServiceHandler struct {
	repo repositories.ServiceRepository
}

func NewServiceHandler(repo repositories.ServiceRepository) *ServiceHandler {
	return &ServiceHandler{repo: repo}
}

// CreateService godoc
// @Summary Create a new service
// @Description Create a new service
// @Tags services
// @Accept  json
// @Produce  json
// @Param service body models.Service true "Service"
// @Success 201 {object} models.Service
// @Router /admin/services [post]
func (h *ServiceHandler) CreateService(c *gin.Context) {
	var service models.Service
	if err := c.ShouldBindJSON(&service); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.CreateService(&service); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, service)
}

// GetAllServices godoc
// @Summary Get all services
// @Description Get all services
// @Tags services
// @Produce  json
// @Success 200 {array} models.Service
// @Router /services [get]
func (h *ServiceHandler) GetAllServices(c *gin.Context) {
	services, err := h.repo.GetAllServices()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, services)
}

// GetServiceByID godoc
// @Summary Get a service by ID
// @Description Get a service by ID
// @Tags services
// @Produce  json
// @Param id path int true "Service ID"
// @Success 200 {object} models.Service
// @Router /services/{id} [get]
func (h *ServiceHandler) GetServiceByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	service, err := h.repo.GetServiceByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}
	c.JSON(http.StatusOK, service)
}

// UpdateService godoc
// @Summary Update a service
// @Description Update a service
// @Tags services
// @Accept  json
// @Produce  json
// @Param id path int true "Service ID"
// @Param service body models.Service true "Service"
// @Success 200 {object} models.Service
// @Router /admin/services/{id} [put]
func (h *ServiceHandler) UpdateService(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	var service models.Service
	if err := c.ShouldBindJSON(&service); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	service.ID = id
	if err := h.repo.UpdateService(&service); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, service)
}

// DeleteService godoc
// @Summary Delete a service
// @Description Delete a service
// @Tags services
// @Param id path int true "Service ID"
// @Success 204
// @Router /admin/services/{id} [delete]
func (h *ServiceHandler) DeleteService(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := h.repo.DeleteService(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
