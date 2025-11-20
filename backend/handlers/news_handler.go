package handlers

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
	"github.com/ihsanularifinm/sid-seirotan/backend/utils"
)

// NewsHandler handles news related requests
type NewsHandler struct {
	NewsRepository repositories.NewsRepository
}

// NewNewsHandler creates a new NewsHandler
func NewNewsHandler(newsRepo repositories.NewsRepository) *NewsHandler {
	return &NewsHandler{NewsRepository: newsRepo}
}

// generateUniqueSlug creates a URL-friendly slug and ensures it is unique in the database.
func (h *NewsHandler) generateUniqueSlug(title string, currentID uint64) (string, error) {
	// Create the base slug
	baseSlug := strings.ToLower(title)
	re := regexp.MustCompile(`[^a-z0-9]+`)
	baseSlug = re.ReplaceAllString(baseSlug, "-")
	baseSlug = strings.Trim(baseSlug, "-")

	// Check if the base slug exists
	slug := baseSlug
	exists, err := h.NewsRepository.IsSlugExist(slug, currentID)
	if err != nil {
		return "", fmt.Errorf("failed to check slug existence: %w", err)
	}

	// If it exists, append a random suffix until it's unique
	for exists {
		rand.Seed(time.Now().UnixNano())
		suffix := strconv.Itoa(rand.Intn(1000)) // Generate a random number between 0-999
		slug = fmt.Sprintf("%s-%s", baseSlug, suffix)

		exists, err = h.NewsRepository.IsSlugExist(slug, currentID)
		if err != nil {
			return "", fmt.Errorf("failed to check slug existence during retry: %w", err)
		}
	}

	return slug, nil
}

// CreateNewsInput defines the expected input for creating a news post
type CreateNewsInput struct {
	Title            string            `json:"title" binding:"required,min=5"`
	Content          string            `json:"content" binding:"required,min=20"`
	Status           models.NewsStatus `json:"status"`
	FeaturedImageURL string            `json:"featured_image_url"`
	PublishedAt      *time.Time        `json:"published_at"`
}

// UpdateNewsInput defines the expected input for updating a news post
type UpdateNewsInput struct {
	Title            string            `json:"title" binding:"omitempty,min=5"`
	Content          string            `json:"content" binding:"omitempty,min=20"`
	Status           models.NewsStatus `json:"status"`
	FeaturedImageURL string            `json:"featured_image_url"`
	PublishedAt      *time.Time        `json:"published_at"`
}

// GetAllNewsForAdmin retrieves all news posts with pagination for the admin panel
func (h *NewsHandler) GetAllNewsForAdmin(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	news, total, err := h.NewsRepository.GetAllNewsForAdmin(page, limit)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to retrieve news", err)
		return
	}

	totalPages := (total + int64(limit) - 1) / int64(limit)

	c.JSON(http.StatusOK, gin.H{
		"data":         news,
		"currentPage":  page,
		"totalPages":   totalPages,
		"totalItems":   total,
	})

	log.Printf("DEBUG GetAllNews: returning %d news items", len(news))
	for _, n := range news {
		log.Printf("DEBUG GetAllNews: news item ID %d has slug '%s'", n.ID, n.Slug)
	}
}

// GetPublishedNews retrieves all news posts with pagination
func (h *NewsHandler) GetPublishedNews(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	news, total, err := h.NewsRepository.GetAllNews(page, limit)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to retrieve news", err)
		return
	}

	totalPages := (total + int64(limit) - 1) / int64(limit)

	c.JSON(http.StatusOK, gin.H{
		"data":         news,
		"currentPage":  page,
		"totalPages":   totalPages,
		"totalItems":   total,
	})

	log.Printf("DEBUG GetAllNews: returning %d news items", len(news))
	for _, n := range news {
		log.Printf("DEBUG GetAllNews: news item ID %d has slug '%s'", n.ID, n.Slug)
	}
}

// GetNewsByID retrieves a single news post by ID
func (h *NewsHandler) GetNewsByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid news ID"})
		return
	}

	news, err := h.NewsRepository.GetNewsByID(id)
	if err != nil {
		utils.RespondError(c, http.StatusNotFound, "News not found", err)
		return
	}
	c.JSON(http.StatusOK, news)
}

// GetNewsBySlug retrieves a single news post by slug
func (h *NewsHandler) GetNewsBySlug(c *gin.Context) {
	slug := c.Param("slug")

	news, err := h.NewsRepository.GetNewsBySlug(slug)
	if err != nil {
		utils.RespondError(c, http.StatusNotFound, "News not found", err)
		return
	}
	c.JSON(http.StatusOK, news)
}

// CreateNews creates a new news post (Admin protected)
func (h *NewsHandler) CreateNews(c *gin.Context) {
	var input CreateNewsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	authorID, exists := c.Get("userID")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "Unauthorized: User ID not found in token", nil)
		return
	}

	// Generate a unique slug
	slug, err := h.generateUniqueSlug(input.Title, 0) // 0 for currentID as it's a new post
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to generate unique slug", err)
		return
	}

	// Create a new News model from the input
	news := models.News{
		Title:            input.Title,
		Content:          input.Content,
		Slug:             slug,
		Status:           input.Status,
		AuthorID:         authorID.(uint64),
		FeaturedImageURL: &input.FeaturedImageURL,
		PublishedAt:      input.PublishedAt,
	}

	if news.Status == "" {
		news.Status = models.NewsStatusDraft // Default status
	}

	// If status is published but no published_at date, set it to now
	if news.Status == models.NewsStatusPublished && news.PublishedAt == nil {
		now := time.Now()
		news.PublishedAt = &now
	}

	if err := h.NewsRepository.CreateNews(&news); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to create news", err)
		return
	}
	c.JSON(http.StatusCreated, news)
}

// UpdateNews updates an existing news post by ID (Admin protected)
func (h *NewsHandler) UpdateNews(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid news ID", err)
		return
	}

	var input UpdateNewsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Fetch the existing news post
	existingNews, err := h.NewsRepository.GetNewsByID(id)
	if err != nil {
		utils.RespondError(c, http.StatusNotFound, "News not found", err)
		return
	}

	// Update fields if they are provided in the input
	log.Printf("DEBUG UpdateNews: input.Title='%s', existingNews.Title='%s'", input.Title, existingNews.Title)
	if input.Title != "" && input.Title != existingNews.Title {
		log.Printf("DEBUG UpdateNews: Title changed. Generating new slug.")
		existingNews.Title = input.Title

		// Re-generate slug if title changes
		slug, err := h.generateUniqueSlug(input.Title, id)
		if err != nil {
			log.Printf("ERROR UpdateNews: Failed to generate unique slug: %v", err)
			utils.RespondError(c, http.StatusInternalServerError, "Failed to generate unique slug", err)
			return
		}
		existingNews.Slug = slug
		log.Printf("DEBUG UpdateNews: New slug generated: %s", existingNews.Slug)
	} else if input.Title != "" && input.Title == existingNews.Title {
		log.Printf("DEBUG UpdateNews: Title provided but is the same as existing. No slug change.")
	} else if input.Title == "" {
		log.Printf("DEBUG UpdateNews: Title is empty in input. No title or slug change.")
	}
	if input.Content != "" {
		log.Printf("DEBUG UpdateNews: Content changed.")
		existingNews.Content = input.Content
	}
	if input.Status != "" {
		log.Printf("DEBUG UpdateNews: Status changed.")
		existingNews.Status = input.Status
	}
	if input.FeaturedImageURL != "" {
		log.Printf("DEBUG UpdateNews: FeaturedImageURL changed.")
		existingNews.FeaturedImageURL = &input.FeaturedImageURL
	}
	
	// Handle PublishedAt update
	if input.PublishedAt != nil {
		existingNews.PublishedAt = input.PublishedAt
	}
	// If status changes to published and no published date exists, set it
	if existingNews.Status == models.NewsStatusPublished && existingNews.PublishedAt == nil {
		now := time.Now()
		existingNews.PublishedAt = &now
	}

	if err := h.NewsRepository.UpdateNews(existingNews); err != nil {
		log.Printf("ERROR UpdateNews: Failed to update news in repository: %v", err)
		utils.RespondError(c, http.StatusInternalServerError, "Failed to update news", err)
		return
	}
	log.Printf("DEBUG UpdateNews: News updated successfully in repository.")
	c.JSON(http.StatusOK, existingNews)
}

// DeleteNews handles the deletion of a news post by ID (Admin protected)
func (h *NewsHandler) DeleteNews(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid news ID"})
		return
	}

	// First, check if the news exists
	_, err = h.NewsRepository.GetNewsByID(id)
	if err != nil {
		utils.RespondError(c, http.StatusNotFound, "News not found", err)
		return
	}

	if err := h.NewsRepository.DeleteNews(id); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to delete news", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "News deleted successfully"})
}
