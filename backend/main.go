package main

import (
	"log"
	"os"
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
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
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

	// Seed the database with a superadmin user if it doesn't exist
	userRepo.SeedSuperadmin()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo)
	newsHandler := handlers.NewNewsHandler(newsRepo)
	villageOfficialHandler := handlers.NewVillageOfficialHandler(villageOfficialRepo)
	potentialHandler := handlers.NewPotentialHandler(potentialRepo)
	contactHandler := handlers.NewContactHandler(contactRepo)
	serviceHandler := handlers.NewServiceHandler(serviceRepo)
	userHandler := handlers.NewUserHandler(userRepo)

	router := gin.Default()

	// Configure CORS
	configCORS := cors.DefaultConfig()
	configCORS.AllowOrigins = []string{"http://localhost:3001"}
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
	routes.SetupPublicRoutes(publicRoutes, newsHandler, villageOfficialHandler, potentialHandler, contactHandler, serviceHandler)
	routes.SetupAdminRoutes(adminRoutes, userHandler, newsHandler, villageOfficialHandler, serviceHandler, potentialHandler, contactHandler)

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