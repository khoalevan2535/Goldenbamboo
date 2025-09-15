import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';

interface SimpleDatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  dateFormat?: string;
  className?: string;
}

const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({
  selectedDate,
  onDateChange,
  placeholder = "Chọn ngày...",
  label,
  disabled = false,
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat = "dd/MM/yyyy",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (date: Date | null) => {
    onDateChange(date);
    setIsOpen(false);
  };

  const handleTodayClick = () => {
    const now = new Date();
    // Nếu có minDate và minDate > now, thì sử dụng minDate
    // Ngược lại sử dụng thời gian hiện tại + 2 phút để đảm bảo hợp lệ
    const selectedDate = minDate && minDate > now ? minDate : new Date(now.getTime() + 2 * 60 * 1000);
    onDateChange(selectedDate);
    setIsOpen(false);
  };

  const handleClearClick = () => {
    onDateChange(null);
    setIsOpen(false);
  };

  return (
    <div className={`simple-date-picker ${className}`}>
      {label && <Form.Label>{label}</Form.Label>}
      
      <div className="position-relative">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          onCalendarOpen={() => setIsOpen(true)}
          onCalendarClose={() => setIsOpen(false)}
          open={isOpen}
          placeholderText={placeholder}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          showTimeSelect={showTimeSelect}
          dateFormat={dateFormat}
          className="form-control"
          popperClassName="datepicker-popper"
          popperPlacement="bottom-start"
          popperModifiers={[
            {
              name: "offset",
              options: {
                offset: [0, 8],
              },
            },
          ]}
          customInput={
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder={placeholder}
                disabled={disabled}
                readOnly
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
              >
                <FaCalendarAlt />
              </button>
            </div>
          }
        />
        
        {isOpen && (
          <div className="datepicker-actions mt-2">
            <Row>
              <Col>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={handleTodayClick}
                  className="w-100"
                >
                  <FaCheck className="me-1" />
                  Hôm nay
                </Button>
              </Col>
              <Col>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={handleClearClick}
                  className="w-100"
                >
                  <FaTimes className="me-1" />
                  Xóa
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDatePicker;

