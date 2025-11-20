package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/ihsanularifinm/sid-seirotan/backend/handlers"
	"github.com/ihsanularifinm/sid-seirotan/backend/middlewares"
)

// SetupPublicRoutes configures all public-facing API routes
func SetupPublicRoutes(public *gin.RouterGroup, newsHandler *handlers.NewsHandler, villageOfficialHandler *handlers.VillageOfficialHandler, potentialHandler *handlers.PotentialHandler, contactHandler *handlers.ContactHandler, serviceHandler *handlers.ServiceHandler) {
	// Apply rate limiting: 5 requests per second, with a burst of 10
	public.Use(middlewares.RateLimitMiddleware(5, 10))

	public.Static("/uploads", "uploads")
	public.GET("/posts", newsHandler.GetPublishedNews)
	public.GET("/posts/:id", newsHandler.GetNewsByID)
	public.GET("/posts/slug/:slug", newsHandler.GetNewsBySlug)
	public.GET("/officials", villageOfficialHandler.GetAllVillageOfficials)
	public.GET("/potentials", potentialHandler.GetAllPotentials)
	public.POST("/contacts", contactHandler.CreateContact)

	// Service Routes
	serviceRoutes := public.Group("/services")
	{
		serviceRoutes.GET("", serviceHandler.GetAllServices)
		serviceRoutes.GET("/:id", serviceHandler.GetServiceByID)
	}
}

// SetupAuthRoutes configures all authentication-related API routes
func SetupAuthRoutes(auth *gin.RouterGroup, authHandler *handlers.AuthHandler) {
	auth.POST("/login", authHandler.Login)
}

// SetupAdminRoutes configures all admin-facing API routes
func SetupAdminRoutes(admin *gin.RouterGroup, userHandler *handlers.UserHandler, newsHandler *handlers.NewsHandler, villageOfficialHandler *handlers.VillageOfficialHandler, serviceHandler *handlers.ServiceHandler, potentialHandler *handlers.PotentialHandler, contactHandler *handlers.ContactHandler) {
	admin.POST("/upload", middlewares.AuthMiddleware(), middlewares.RoleMiddleware("admin", "superadmin"), handlers.UploadFile)

	// User Management Routes
	userRoutes := admin.Group("/users")
	userRoutes.Use(middlewares.AuthMiddleware(), middlewares.RoleMiddleware("admin", "superadmin"))
	{
		userRoutes.POST("", userHandler.CreateUser)
		userRoutes.GET("", userHandler.GetAllUsers)
		userRoutes.GET("/:id", userHandler.GetUserByID)
		userRoutes.PUT("/:id", userHandler.UpdateUser)
		userRoutes.DELETE("/:id", userHandler.DeleteUser)
	}

	// News Management Routes
	newsRoutes := admin.Group("/posts")
	newsRoutes.Use(middlewares.AuthMiddleware(), middlewares.RoleMiddleware("admin", "superadmin"))
	{
		newsRoutes.GET("", newsHandler.GetAllNewsForAdmin)
		newsRoutes.POST("", newsHandler.CreateNews)
		newsRoutes.PUT("/:id", newsHandler.UpdateNews)
		newsRoutes.DELETE("/:id", newsHandler.DeleteNews)
	}

	// Add other admin routes here as they are implemented
	villageOfficialRoutes := admin.Group("/officials")
	villageOfficialRoutes.Use(middlewares.AuthMiddleware(), middlewares.RoleMiddleware("admin", "superadmin"))
	{
		villageOfficialRoutes.POST("", villageOfficialHandler.CreateVillageOfficial)
		villageOfficialRoutes.GET("/:id", villageOfficialHandler.GetVillageOfficialByID)
		villageOfficialRoutes.PUT("/:id", villageOfficialHandler.UpdateVillageOfficial)
		villageOfficialRoutes.DELETE("/:id", villageOfficialHandler.DeleteVillageOfficial)
	}
			
	// Service Management Routes
	serviceAdminRoutes := admin.Group("/services")
	serviceAdminRoutes.Use(middlewares.AuthMiddleware(), middlewares.RoleMiddleware("admin", "superadmin"))
	{
		serviceAdminRoutes.GET("", serviceHandler.GetAllServices)
		serviceAdminRoutes.POST("", serviceHandler.CreateService)
		serviceAdminRoutes.PUT("/:id", serviceHandler.UpdateService)
		serviceAdminRoutes.DELETE("/:id", serviceHandler.DeleteService)
	}

	// Potential Management Routes
	potentialAdminRoutes := admin.Group("/potentials")
	potentialAdminRoutes.Use(middlewares.AuthMiddleware(), middlewares.RoleMiddleware("admin", "superadmin"))
	{
		potentialAdminRoutes.POST("", potentialHandler.CreatePotential)
		potentialAdminRoutes.PUT("/:id", potentialHandler.UpdatePotential)
		potentialAdminRoutes.DELETE("/:id", potentialHandler.DeletePotential)
	}

	// Contact Management Routes
	contactAdminRoutes := admin.Group("/contacts")
	contactAdminRoutes.Use(middlewares.AuthMiddleware(), middlewares.RoleMiddleware("admin", "superadmin"))
	{
		contactAdminRoutes.GET("", contactHandler.GetAllContacts)
	}

}