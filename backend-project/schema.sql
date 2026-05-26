create database y_bus_booking;

use y_bus_booking;

 CREATE TABLE yk_users(
    UserID INT(11) PRIMARY KEY AUTO_INCREMENT, 
    UserName VARCHAR(100) UNIQUE NOT NULL, 
    Password VARCHAR(100) NOT NULL, 
    UserRole ENUM('admin', 'user')
);
CREATE TABLE yk_buses(
    BusID INT(11) PRIMARY KEY AUTO_INCREMENT, 
    PlateNumber VARCHAR(100) UNIQUE, 
    TotalSeats INT(11) NOT NULL, 
    BusType VARCHAR(100)
);
 CREATE TABLE yk_schedules(
    ScheduleID INT(11) PRIMARY KEY AUTO_INCREMENT, 
    BusID INT(11), RouteName VARCHAR(100), 
    DeparturePoint VARCHAR(100), 
    Destination VARCHAR(100), 
    DepartureTime TIME, 
    EstimatedArrivalTime TIME, 
    TicketPrice INT(11), 
    ScheduleStatus VARCHAR(100), 
    FOREIGN KEY (BusID) REFERENCES yk_buses(BusID) 
    ON DELETE CASCADE
);
 CREATE TABLE yk_bookings(
    BookingID INT(11) PRIMARY KEY AUTO_INCREMENT, 
    ScheduleID INT(11),
    UserID INT(11),
    PassengerName VARCHAR(100), 
    PassengerGender ENUM('Male', 'Female', 'Other'), 
    PassengerPhone INT(11), 
    SeatNumber INT(11), 
    PaymentStatus VARCHAR(100), 
    BookingDate DATE, 
    FOREIGN KEY (ScheduleID) REFERENCES yk_schedules(ScheduleID) 
    ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES yk_users(UserID)
    ON DELETE CASCADE
);