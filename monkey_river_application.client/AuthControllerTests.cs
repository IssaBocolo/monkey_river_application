[Fact]
public async Task Login_WithValidCredentials_ReturnsToken()
{
	var loginDto = new LoginDto { Email = "test@example.com", Password = "password" };
	var authServiceMock = new Mock<IAuthService>();
	authServiceMock.Setup(s => s.LoginAsync(loginDto)).ReturnsAsync("mock-jwt-token");

	var controller = new AuthController(authServiceMock.Object);
	var result = await controller.Login(loginDto);

	var okResult = Assert.IsType<OkObjectResult>(result);
	Assert.Equal("mock-jwt-token", okResult.Value);
}

[Fact]
public async Task UpdateUserProfile_ValidRequest_UpdatesSuccessfully()
{
	var userService = new Mock<IUserService>();
	var dto = new UpdateUserDto { Name = "Daniel", Email = "dan@example.com" };

	var controller = new UsersController(userService.Object);
	var result = await controller.UpdateProfile(1, dto);

	Assert.IsType<NoContentResult>(result);
}

[Fact]
public async Task GetAlerts_ReturnsList()
{
	var mockRepo = new Mock<IAlertRepository>();
	mockRepo.Setup(r => r.GetAllAsync())
			.ReturnsAsync(new List<Alert> { new Alert { Title = "Test", Status = "Open" } });

	var controller = new AlertsController(mockRepo.Object);
	var result = await controller.GetAll();

	var okResult = Assert.IsType<OkObjectResult>(result);
	var alerts = Assert.IsAssignableFrom<IEnumerable<Alert>>(okResult.Value);
	Assert.Single(alerts);
}

[Fact]
public async Task AddDiagnosticTest_SavesToDb()
{
	var context = new TestDbContext();
	var service = new DiagnosticTestService(context);

	await service.CreateAsync(new DiagnosticTest { Name = "Blood Test", Result = "Positive", Date = DateTime.Today });
	Assert.Single(context.DiagnosticTests);
}
