#Salary vs. Years of Experiences (linear)
data <- Salary_Age_Experience

model1 <- lm(Salary ~ YearsExperience, data = data)

plot(data$YearsExperience, data$Salary,
     main = "Salary vs. Years of Experience",
     xlab = "Years of Experience", ylab = "Salary",
     pch = 16, col = "steelblue", cex = 1.2)

abline(model1, col = "tomato", lwd = 2)

A <- cbind(1, data$YearsExperience)
b <- data$Salary
print(A)
print(b)

#Salary vs. Age (Quadratic)
data$Age2 <- data$Age^2
model2 <- lm(Salary ~ Age + Age2, data = data)

x_seq <- seq(min(data$Age), max(data$Age), length.out = 200)
y_pred <- predict(model2, newdata = data.frame(
  Age = x_seq, Age2 = x_seq^2))

plot(data$Age, data$Salary,
     main = "Salary vs. Age (Quadratic)",
     xlab = "Age", ylab = "Salary",
     pch = 16, col = "steelblue", cex = 1.2)

lines(x_seq, y_pred, col = "tomato", lwd = 2)

#Salary vs. Age & Years of Experiences
library(scatterplot3d)

working <- data[!is.na(data$YearsExperience), ]

working$Age2 <- working$Age^2
model3 <- lm(Salary ~ YearsExperience + Age + Age2, data = working)

s3d <- scatterplot3d(working$YearsExperience, working$Age, working$Salary,
      main = "Salary vs. Age & Years of Experience (3D)",
      xlab = "Years of Experience",
      ylab = "Age",
      zlab = "Salary",
      pch = 16, color = "steelblue", angle = 45)

x_seq <- seq(min(working$YearsExperience), max(working$YearsExperience), length.out = 20)
a_seq <- seq(min(working$Age), max(working$Age), length.out = 20)
grid <- expand.grid(YearsExperience = x_seq, Age = a_seq)
grid$Age2 <- grid$Age^2
grid$Salary <- predict(model3, newdata = grid)

s3d$points3d(grid$YearsExperience, grid$Age, grid$Salary,
             col = rgb(1, 0.3, 0.3, 0.4), pch = 46, cex = 3)
