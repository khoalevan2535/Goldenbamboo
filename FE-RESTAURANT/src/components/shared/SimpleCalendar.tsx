import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

interface SimpleCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  highlightedDates?: Date[];
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  showToday?: boolean;
  showNavigation?: boolean;
  className?: string;
}

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({
  selectedDate,
  onDateSelect,
  highlightedDates = [],
  disabledDates = [],
  minDate,
  maxDate,
  showToday = true,
  showNavigation = true,
  className = ""
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isHighlighted = (date: Date) => {
    return highlightedDates.some(highlighted => 
      date.toDateString() === highlighted.toDateString()
    );
  };

  const isDisabled = (date: Date) => {
    if (disabledDates.some(disabled => 
      date.toDateString() === disabled.toDateString()
    )) {
      return true;
    }
    
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (!isDisabled(date) && onDateSelect) {
      onDateSelect(date);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    if (onDateSelect) {
      // Nếu có minDate và minDate > today, thì sử dụng minDate
      // Ngược lại sử dụng thời gian hiện tại + 2 phút để đảm bảo hợp lệ
      const selectedDate = minDate && minDate > today ? minDate : new Date(today.getTime() + 2 * 60 * 1000);
      onDateSelect(selectedDate);
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayClasses = ['calendar-day'];
      
      if (isToday(date)) dayClasses.push('today');
      if (isSelected(date)) dayClasses.push('selected');
      if (isHighlighted(date)) dayClasses.push('highlighted');
      if (isDisabled(date)) dayClasses.push('disabled');

      days.push(
        <div
          key={day}
          className={dayClasses.join(' ')}
          onClick={() => handleDateClick(date)}
        >
          <span className="day-number">{day}</span>
          {isHighlighted(date) && (
            <Badge bg="warning" className="highlight-badge">•</Badge>
          )}
        </div>
      );
    }

    return days;
  };

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <Card className={`simple-calendar ${className}`}>
      <Card.Header className="calendar-header">
        <Row className="align-items-center">
          {showNavigation && (
            <Col xs={2}>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={goToPreviousMonth}
              >
                <FaChevronLeft />
              </Button>
            </Col>
          )}
          
          <Col className="text-center">
            <h6 className="mb-0">
              <FaCalendarAlt className="me-2" />
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h6>
          </Col>
          
          {showNavigation && (
            <Col xs={2} className="text-end">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={goToNextMonth}
              >
                <FaChevronRight />
              </Button>
            </Col>
          )}
        </Row>
        
        {showToday && (
          <div className="text-center mt-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={goToToday}
            >
              Hôm nay
            </Button>
          </div>
        )}
      </Card.Header>
      
      <Card.Body className="calendar-body p-0">
        {/* Week day headers */}
        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="calendar-grid">
          {renderCalendarDays()}
        </div>
      </Card.Body>
    </Card>
  );
};

export default SimpleCalendar;

