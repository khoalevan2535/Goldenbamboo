import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaCheck, FaTimes, FaArrowRight } from 'react-icons/fa';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  dateFormat?: string;
  className?: string;
  showQuickSelects?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRangeChange,
  placeholder = "Chọn khoảng thời gian...",
  label,
  disabled = false,
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat = "dd/MM/yyyy",
  className = "",
  showQuickSelects = true
}) => {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const handleStartDateChange = (date: Date | null) => {
    onStartDateChange(date);
    if (onRangeChange) {
      onRangeChange(date, endDate);
    }
    setIsStartOpen(false);
  };

  const handleEndDateChange = (date: Date | null) => {
    onEndDateChange(date);
    if (onRangeChange) {
      onRangeChange(startDate, date);
    }
    setIsEndOpen(false);
  };

  const handleQuickSelect = (days: number) => {
    const today = new Date();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);
    
    onStartDateChange(startDate);
    onEndDateChange(endDate);
    if (onRangeChange) {
      onRangeChange(startDate, endDate);
    }
  };

  const handleClearRange = () => {
    onStartDateChange(null);
    onEndDateChange(null);
    if (onRangeChange) {
      onRangeChange(null, null);
    }
  };

  const getSelectedRangeText = () => {
    if (!startDate && !endDate) return placeholder;
    if (startDate && !endDate) return `Từ: ${startDate.toLocaleDateString('vi-VN')}`;
    if (!startDate && endDate) return `Đến: ${endDate.toLocaleDateString('vi-VN')}`;
    return `${startDate?.toLocaleDateString('vi-VN')} - ${endDate?.toLocaleDateString('vi-VN')}`;
  };

  return (
    <div className={`date-range-picker ${className}`}>
      {label && <Form.Label>{label}</Form.Label>}
      
      <div className="position-relative">
        {/* Display selected range */}
        <div className="selected-range-display mb-2">
          <Badge bg="info" className="p-2">
            <FaCalendarAlt className="me-1" />
            {getSelectedRangeText()}
          </Badge>
        </div>

        <Row>
          <Col md={6}>
            <div className="position-relative">
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                onCalendarOpen={() => setIsStartOpen(true)}
                onCalendarClose={() => setIsStartOpen(false)}
                open={isStartOpen}
                placeholderText="Từ ngày..."
                disabled={disabled}
                minDate={minDate}
                maxDate={endDate || maxDate}
                showTimeSelect={showTimeSelect}
                dateFormat={dateFormat}
                className="form-control"
                popperClassName="datepicker-popper"
                popperPlacement="bottom-start"
                customInput={
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Từ ngày..."
                      disabled={disabled}
                      readOnly
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setIsStartOpen(!isStartOpen)}
                      disabled={disabled}
                    >
                      <FaCalendarAlt />
                    </button>
                  </div>
                }
              />
            </div>
          </Col>
          
          <Col md={6}>
            <div className="position-relative">
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                onCalendarOpen={() => setIsEndOpen(true)}
                onCalendarClose={() => setIsEndOpen(false)}
                open={isEndOpen}
                placeholderText="Đến ngày..."
                disabled={disabled}
                minDate={startDate || minDate}
                maxDate={maxDate}
                showTimeSelect={showTimeSelect}
                dateFormat={dateFormat}
                className="form-control"
                popperClassName="datepicker-popper"
                popperPlacement="bottom-start"
                customInput={
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Đến ngày..."
                      disabled={disabled}
                      readOnly
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setIsEndOpen(!isEndOpen)}
                      disabled={disabled}
                    >
                      <FaCalendarAlt />
                    </button>
                  </div>
                }
              />
            </div>
          </Col>
        </Row>

        {/* Quick select buttons */}
        {showQuickSelects && (
          <div className="quick-selects mt-3">
            <Row>
              <Col>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => handleQuickSelect(7)}
                  className="w-100"
                >
                  7 ngày qua
                </Button>
              </Col>
              <Col>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => handleQuickSelect(30)}
                  className="w-100"
                >
                  30 ngày qua
                </Button>
              </Col>
              <Col>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => handleQuickSelect(90)}
                  className="w-100"
                >
                  90 ngày qua
                </Button>
              </Col>
              <Col>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={handleClearRange}
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

export default DateRangePicker;

