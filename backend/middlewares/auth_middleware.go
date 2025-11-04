package middlewares

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/ihsanularifinm/sid-seirotan/backend/utils"
)

// AuthMiddleware validates JWT tokens for protected routes
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			return
		}

		tokenString := parts[1]
		claims := &utils.Claims{} // Use our custom claims struct

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			jwtSecret := os.Getenv("JWT_SECRET") // Use our JWT_SECRET
			if jwtSecret == "" {
				return nil, fmt.Errorf("JWT_SECRET environment variable not set")
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token", "details": err.Error()})
			return
		}

		c.Set("userID", claims.UserID)     // Set user ID
		c.Set("username", claims.Username) // Set username
		c.Set("userRole", claims.Role)     // Set role

		c.Next()
	}
}

// RoleMiddleware checks if the authenticated user has one of the required roles
func RoleMiddleware(requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Ensure AuthMiddleware has run first
		AuthMiddleware()(c) // Call AuthMiddleware directly
		if c.IsAborted() {
			return // If AuthMiddleware aborted, stop here
		}

		// Get role from context, set by AuthMiddleware
		role, exists := c.Get("userRole")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "User role not found in token claims"})
			return
		}

		userRole := role.(string)
		isAllowed := false
		for _, requiredRole := range requiredRoles {
			if userRole == requiredRole {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "You do not have permission to access this resource"})
			return
		}

		c.Next()
	}
}