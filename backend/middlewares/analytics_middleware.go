package middlewares

import (
	"crypto/sha256"
	"encoding/hex"
	"log"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
)

// AnalyticsMiddleware tracks page views for analytics
func AnalyticsMiddleware(repo repositories.PageViewRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip tracking for:
		// - Admin routes
		// - API routes
		// - Static assets
		// - Next.js internal routes
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/admin") ||
			strings.HasPrefix(path, "/api") ||
			strings.HasPrefix(path, "/assets") ||
			strings.HasPrefix(path, "/_next") ||
			strings.HasPrefix(path, "/favicon") ||
			strings.HasPrefix(path, "/robots") ||
			strings.HasPrefix(path, "/sitemap") {
			c.Next()
			return
		}

		// Get visitor ID (hash of IP address for privacy)
		visitorID := hashIP(c.ClientIP())

		// Get page info
		pageURL := c.Request.URL.Path
		userAgent := c.Request.UserAgent()
		referer := c.Request.Referer()

		// Track asynchronously to not block request
		go func() {
			pageView := models.PageView{
				PageURL:   pageURL,
				VisitorID: visitorID,
				UserAgent: &userAgent,
				Referer:   &referer,
				ViewedAt:  time.Now(),
			}

			if err := repo.Create(&pageView); err != nil {
				log.Printf("Failed to track page view for %s: %v", pageURL, err)
			}
		}()

		c.Next()
	}
}

// hashIP creates a SHA-256 hash of the IP address for privacy
func hashIP(ip string) string {
	hash := sha256.Sum256([]byte(ip))
	return hex.EncodeToString(hash[:])
}
