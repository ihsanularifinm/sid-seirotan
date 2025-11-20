package config

import (
	"fmt"
	"log"
	"os"

	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB() *gorm.DB {
	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")

	// Defaults for Docker environment
	if dbHost == "" {
		dbHost = "db" // Docker service name
	}
	if dbPort == "" {
		dbPort = "5432" // Internal PostgreSQL port
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		dbHost, dbUser, dbPassword, dbName, dbPort)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connection established")

	// Run database migrations
	log.Println("Running database migrations...")
	if err := runMigrations(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}
	log.Println("Database migrations completed")

	return db
}

func runMigrations(db *gorm.DB) error {
	// Create custom ENUM types if they don't exist
	enumTypes := []string{
		"CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'author')",
		"CREATE TYPE news_status AS ENUM ('draft', 'published', 'archived')",
		"CREATE TYPE potential_type AS ENUM ('umkm', 'tourism', 'agriculture', 'other')",
	}

	for _, enumSQL := range enumTypes {
		// Check if type exists, if not create it
		if err := db.Exec(enumSQL).Error; err != nil {
			// Ignore error if type already exists
			log.Printf("Note: %v (this is normal if types already exist)", err)
		}
	}

	// Auto-migrate tables
	return db.AutoMigrate(
		&models.User{},
		&models.News{},
		&models.VillageOfficial{},
		&models.Service{},
		&models.Potential{},
		&models.SiteSetting{},
		&models.Contact{},
	)
}
