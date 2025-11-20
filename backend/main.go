package main

import (
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/config"
	"github.com/ihsanularifinm/sid-seirotan/backend/handlers"
	"github.com/ihsanularifinm/sid-seirotan/backend/repositories"
	"github.com/ihsanularifinm/sid-seirotan/backend/routes"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file (optional in production/Docker)
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables from system")
	}

	// Initialize database connection
	db := config.InitDB()

	// Initialize repositories
	userRepo := repositories.NewGormUserRepository(db)
	newsRepo := repositories.NewGormNewsRepository(db)
	villageOfficialRepo := repositories.NewGormVillageOfficialRepository(db)
	potentialRepo := repositories.NewGormPotentialRepository(db)
	contactRepo := repositories.NewGormContactRepository(db)
	serviceRepo := repositories.NewGormServiceRepository(db)
	heroSliderRepo := repositories.NewGormHeroSliderRepository(db)
	siteSettingsRepo := repositories.NewGormSiteSettingsRepository(db)

	// Seed the database with default users if they don't exist
	userRepo.SeedSuperadmin()
	userRepo.SeedDefaultAdmin()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo)
	newsHandler := handlers.NewNewsHandler(newsRepo)
	villageOfficialHandler := handlers.NewVillageOfficialHandler(villageOfficialRepo)
	potentialHandler := handlers.NewPotentialHandler(potentialRepo)
	contactHandler := handlers.NewContactHandler(contactRepo)
	serviceHandler := handlers.NewServiceHandler(serviceRepo)
	userHandler := handlers.NewUserHandler(userRepo)
	heroSliderHandler := handlers.NewHeroSliderHandler(heroSliderRepo)
	siteSettingsHandler := handlers.NewSiteSettingsHandler(siteSettingsRepo)

	router := gin.Default()

	// Configure CORS
	configCORS := cors.DefaultConfig()
	origins := os.Getenv("ALLOWED_ORIGINS")
	if origins == "" {
		origins = "http://localhost:3001,http://localhost:3000" // Fallback
	}
	configCORS.AllowOrigins = strings.Split(origins, ",")
	configCORS.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	configCORS.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	configCORS.AllowCredentials = true
	configCORS.MaxAge = 12 * time.Hour
	router.Use(cors.New(configCORS))

	// Create route groups
	publicRoutes := router.Group("/api/v1")
	authRoutes := router.Group("/api/v1/auth")
	adminRoutes := publicRoutes.Group("/admin")

	// Setup routes
	routes.SetupAuthRoutes(authRoutes, authHandler)
	routes.SetupPublicRoutes(publicRoutes, newsHandler, villageOfficialHandler, potentialHandler, contactHandler, serviceHandler, heroSliderHandler, siteSettingsHandler)
	routes.SetupAdminRoutes(adminRoutes, userHandler, newsHandler, villageOfficialHandler, serviceHandler, potentialHandler, contactHandler, heroSliderHandler, siteSettingsHandler)

	// Run the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	// Print all registered routes
	for _, route := range router.Routes() {
		log.Printf("Registered route: %s %s", route.Method, route.Path)
	}

	log.Printf("Server running on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}