
package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
	"github.com/ihsanularifinm/sid-seirotan/backend/utils"
)

type ServiceHandler struct {
	repo repositories.ServiceRepository
}

func NewServiceHandler(repo repositories.ServiceRepository) *ServiceHandler {
	return &ServiceHandler{repo: repo}
}

// CreateServiceInput defines the input for creating a service
type CreateServiceInput struct {
	ServiceName  string `json:"service_name" binding:"required"`
	Description  string `json:"description"`
	Requirements string `json:"requirements"`
}

// UpdateServiceInput defines the input for updating a service
type UpdateServiceInput struct {
	ServiceName  string `json:"service_name"`
	Description  string `json:"description"`
	Requirements string `json:"requirements"`
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
	var input CreateServiceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	service := models.Service{
		ServiceName:  input.ServiceName,
		Description:  &input.Description,
		Requirements: &input.Requirements,
	}

	if err := h.repo.CreateService(&service); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to create service", err)
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
		utils.RespondError(c, http.StatusInternalServerError, "Failed to retrieve services", err)
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
		utils.RespondError(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	service, err := h.repo.GetServiceByID(id)
	if err != nil {
		utils.RespondError(c, http.StatusNotFound, "Service not found", err)
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
		utils.RespondError(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	var input UpdateServiceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Ideally fetch first, but sticking to simple update for now as per original logic, but using input struct
	service := models.Service{
		ID:           id,
		ServiceName:  input.ServiceName,
		Description:  &input.Description,
		Requirements: &input.Requirements,
	}

	if err := h.repo.UpdateService(&service); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to update service", err)
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
		utils.RespondError(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	if err := h.repo.DeleteService(id); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to delete service", err)
		return
	}
	c.Status(http.StatusNoContent)
}
