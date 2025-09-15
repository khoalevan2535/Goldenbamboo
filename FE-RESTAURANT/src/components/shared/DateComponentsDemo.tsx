import React, { useState } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody, Form, Button } from 'react-bootstrap';
import SimpleDatePicker from './SimpleDatePicker';
import DateRangePicker from './DateRangePicker';
import SimpleCalendar from './SimpleCalendar';
import './DateComponents.css';

const DateComponentsDemo: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [calendarDate, setCalendarDate] = useState<Date | null>(null);

  // Sample highlighted dates for calendar
  const highlightedDates = [
    new Date(2024, 11, 25), // Christmas
    new Date(2024, 11, 31), // New Year's Eve
    new Date(2025, 0, 1),   // New Year's Day
  ];

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    };

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Date Components Demo</h2>
      
      <Row>
        {/* Simple Date Picker */}
        <Col lg={6} className="mb-4">
          <Card>
            <CardHeader>
              <h5>Simple Date Picker</h5>
            </CardHeader>
            <CardBody>
              <Form>
                <SimpleDatePicker
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  label="Chọn ngày"
                  placeholder="Chọn ngày..."
                  minDate={new Date()}
                  showTimeSelect={false}
                />
                
                <div className="mt-3">
                  <strong>Ngày đã chọn:</strong> {selectedDate ? selectedDate.toLocaleDateString('vi-VN') : 'Chưa chọn'}
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* Date Range Picker */}
        <Col lg={6} className="mb-4">
          <Card>
            <CardHeader>
              <h5>Date Range Picker</h5>
            </CardHeader>
            <CardBody>
              <Form>
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onRangeChange={handleDateRangeChange}
                  label="Chọn khoảng thời gian"
                  placeholder="Chọn khoảng thời gian..."
                  showQuickSelects={true}
                />
                
                <div className="mt-3">
                  <strong>Khoảng thời gian:</strong><br />
                  Từ: {startDate ? startDate.toLocaleDateString('vi-VN') : 'Chưa chọn'}<br />
                  Đến: {endDate ? endDate.toLocaleDateString('vi-VN') : 'Chưa chọn'}
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Simple Calendar */}
        <Col lg={8} className="mb-4">
          <Card>
            <CardHeader>
              <h5>Simple Calendar</h5>
            </CardHeader>
            <CardBody>
              <SimpleCalendar
                selectedDate={calendarDate}
                onDateSelect={setCalendarDate}
                highlightedDates={highlightedDates}
                showToday={true}
                showNavigation={true}
              />
              
              <div className="mt-3">
                <strong>Ngày đã chọn:</strong> {calendarDate ? calendarDate.toLocaleDateString('vi-VN') : 'Chưa chọn'}
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Usage Examples */}
        <Col lg={4} className="mb-4">
          <Card>
            <CardHeader>
              <h5>Cách sử dụng</h5>
            </CardHeader>
            <CardBody>
              <h6>1. Simple Date Picker</h6>
              <pre className="bg-light p-2 rounded">
{`<SimpleDatePicker
  selectedDate={date}
  onDateChange={setDate}
  label="Chọn ngày"
  minDate={new Date()}
/>`}
              </pre>

              <h6>2. Date Range Picker</h6>
              <pre className="bg-light p-2 rounded">
{`<DateRangePicker
  startDate={startDate}
  endDate={endDate}
  onStartDateChange={setStartDate}
  onEndDateChange={setEndDate}
  showQuickSelects={true}
/>`}
              </pre>

              <h6>3. Simple Calendar</h6>
              <pre className="bg-light p-2 rounded">
{`<SimpleCalendar
  selectedDate={date}
  onDateSelect={setDate}
  highlightedDates={[date1, date2]}
/>`}
              </pre>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <CardHeader>
              <h5>Lợi ích của việc không sử dụng VietnamHolidayService</h5>
            </CardHeader>
            <CardBody>
              <ul>
                <li><strong>Đơn giản hóa:</strong> Không cần quản lý database cho ngày lễ</li>
                <li><strong>Hiệu suất tốt:</strong> Không cần truy vấn database</li>
                <li><strong>Linh hoạt:</strong> Có thể highlight bất kỳ ngày nào</li>
                <li><strong>Dễ bảo trì:</strong> Ít code phức tạp hơn</li>
                <li><strong>Đa năng:</strong> Có thể sử dụng cho nhiều mục đích khác</li>
              </ul>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DateComponentsDemo;

