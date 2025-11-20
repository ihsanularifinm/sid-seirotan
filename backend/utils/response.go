package utils

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RespondError sends a JSON error response and logs the error if it's an internal server error.
func RespondError(c *gin.Context, code int, message string, err error) {
	if code == http.StatusInternalServerError && err != nil {
		log.Printf("INTERNAL ERROR: %v", err)
		// Don't expose the raw error to the client for 500s
		c.JSON(code, gin.H{"error": message})
	} else if err != nil {
		// For other errors (400, 404, etc.), it's usually safe/useful to show the error message
		// But we can also choose to hide it if 'message' is sufficient.
		// Here we prefer the custom message if provided, otherwise the error string.
		if message != "" {
			c.JSON(code, gin.H{"error": message, "details": err.Error()})
		} else {
			c.JSON(code, gin.H{"error": err.Error()})
		}
	} else {
		c.JSON(code, gin.H{"error": message})
	}
}
