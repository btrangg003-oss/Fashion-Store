import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiMapPin, FiCheck, FiClock, FiPackage, FiNavigation } from 'react-icons/fi';

interface PickingLocation {
  warehouseZone: string;
  aisle: string;
  shelf: string;
  bin: string;
  level: number;
}

interface PickingTask {
  id: string;
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  location: PickingLocation;
  pickingOrder: number;
  picked: boolean;
  pickedAt?: string;
  pickedBy?: string;
  image?: string;
}

interface PickingRouteDisplayProps {
  tasks: PickingTask[];
  onTaskComplete: (taskId: string) => void;
  onAllComplete?: () => void;
}

const PickingRouteDisplay: React.FC<PickingRouteDisplayProps> = ({
  tasks,
  onTaskComplete,
  onAllComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (tasks.length > 0 && !startTime) {
      setStartTime(new Date());
    }
  }, [tasks]);

  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    const nextUnpicked = tasks.findIndex(t => !t.picked);
    if (nextUnpicked !== -1) {
      setCurrentIndex(nextUnpicked);
    }
  }, [tasks]);

  const handleTaskComplete = (taskId: string) => {
    onTaskComplete(taskId);
    
    const allCompleted = tasks.every(t => t.picked || t.id === taskId);
    if (allCompleted && onAllComplete) {
      onAllComplete();
    }
  };

  const completedCount = tasks.filter(t => t.picked).length;
  const progress = (completedCount / tasks.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLocation = (loc: PickingLocation) => {
    return `${loc.warehouseZone}-${loc.aisle}-${loc.shelf}-${loc.bin}-T${loc.level}`;
  };

  if (tasks.length === 0) {
    return (
      <EmptyState>
        <FiPackage size={48} />
        <EmptyText>Không có sản phẩm nào cần lấy</EmptyText>
      </EmptyState>
    );
  }

  const currentTask = tasks[currentIndex];

  return (
    <Container>
      <StatsBar>
        <StatItem>
          <StatIcon><FiPackage /></StatIcon>
          <StatInfo>
            <StatLabel>Tiến độ</StatLabel>
            <StatValue>{completedCount}/{tasks.length}</StatValue>
          </StatInfo>
        </StatItem>

        <StatItem>
          <StatIcon><FiClock /></StatIcon>
          <StatInfo>
            <StatLabel>Thời gian</StatLabel>
            <StatValue>{formatTime(elapsedTime)}</StatValue>
          </StatInfo>
        </StatItem>

        <StatItem>
          <StatIcon><FiNavigation /></StatIcon>
          <StatInfo>
            <StatLabel>Vị trí hiện tại</StatLabel>
            <StatValue>{currentTask ? formatLocation(currentTask.location) : '-'}</StatValue>
          </StatInfo>
        </StatItem>
      </StatsBar>

      <ProgressSection>
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>
        <ProgressText>{Math.round(progress)}% hoàn thành</ProgressText>
      </ProgressSection>

      {currentTask && !currentTask.picked && (
        <CurrentTaskCard>
          <CurrentTaskHeader>
            <CurrentTaskTitle>
              <FiMapPin /> Đang lấy hàng
            </CurrentTaskTitle>
            <TaskNumber>#{currentTask.pickingOrder}</TaskNumber>
          </CurrentTaskHeader>

          <CurrentTaskContent>
            {currentTask.image && (
              <TaskImage src={currentTask.image} alt={currentTask.name} />
            )}
            
            <TaskInfo>
              <TaskName>{currentTask.name}</TaskName>
              <TaskSKU>SKU: {currentTask.sku}</TaskSKU>
              <TaskQuantity>Số lượng: <strong>{currentTask.quantity}</strong></TaskQuantity>
            </TaskInfo>
          </CurrentTaskContent>

          <LocationCard>
            <LocationIcon zone={currentTask.location.warehouseZone}>
              {currentTask.location.warehouseZone}
            </LocationIcon>
            <LocationDetails>
              <LocationRow>
                <LocationLabel>Khu vực:</LocationLabel>
                <LocationValue>Zone {currentTask.location.warehouseZone}</LocationValue>
              </LocationRow>
              <LocationRow>
                <LocationLabel>Lối đi:</LocationLabel>
                <LocationValue>Aisle {currentTask.location.aisle}</LocationValue>
              </LocationRow>
              <LocationRow>
                <LocationLabel>Kệ:</LocationLabel>
                <LocationValue>Shelf {currentTask.location.shelf}</LocationValue>
              </LocationRow>
              <LocationRow>
                <LocationLabel>Ngăn:</LocationLabel>
                <LocationValue>Bin {currentTask.location.bin}</LocationValue>
              </LocationRow>
              <LocationRow>
                <LocationLabel>Tầng:</LocationLabel>
                <LocationValue>Level {currentTask.location.level}</LocationValue>
              </LocationRow>
            </LocationDetails>
          </LocationCard>

          <CompleteButton onClick={() => handleTaskComplete(currentTask.id)}>
            <FiCheck /> Đã lấy xong
          </CompleteButton>
        </CurrentTaskCard>
      )}

      <TaskList>
        <TaskListHeader>
          <TaskListTitle>Danh sách lấy hàng ({tasks.length})</TaskListTitle>
        </TaskListHeader>

        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            picked={task.picked}
            current={index === currentIndex && !task.picked}
          >
            <TaskItemLeft>
              <TaskOrder picked={task.picked}>
                {task.picked ? <FiCheck /> : task.pickingOrder}
              </TaskOrder>
              
              <TaskItemInfo>
                <TaskItemName picked={task.picked}>{task.name}</TaskItemName>
                <TaskItemMeta>
                  <TaskItemSKU>{task.sku}</TaskItemSKU>
                  <TaskItemQty>× {task.quantity}</TaskItemQty>
                </TaskItemMeta>
              </TaskItemInfo>
            </TaskItemLeft>

            <TaskItemRight>
              <TaskLocation zone={task.location.warehouseZone}>
                <FiMapPin />
                {formatLocation(task.location)}
              </TaskLocation>

              {!task.picked && (
                <TaskCheckButton
                  onClick={() => handleTaskComplete(task.id)}
                  disabled={index !== currentIndex}
                >
                  <FiCheck />
                </TaskCheckButton>
              )}

              {task.picked && (
                <PickedBadge>
                  <FiCheck /> Đã lấy
                </PickedBadge>
              )}
            </TaskItemRight>
          </TaskItem>
        ))}
      </TaskList>

      <MapSection>
        <MapTitle>Sơ đồ kho</MapTitle>
        <WarehouseMap>
          {['A', 'B', 'C', 'D'].map(zone => {
            const zoneTasks = tasks.filter(t => t.location.warehouseZone === zone);
            const zoneCompleted = zoneTasks.filter(t => t.picked).length;
            const isCurrentZone = currentTask?.location.warehouseZone === zone;

            return (
              <ZoneCard
                key={zone}
                zone={zone}
                current={isCurrentZone}
              >
                <ZoneName>Zone {zone}</ZoneName>
                <ZoneStats>
                  {zoneCompleted}/{zoneTasks.length}
                </ZoneStats>
                {isCurrentZone && <CurrentMarker>📍</CurrentMarker>}
              </ZoneCard>
            );
          })}
        </WarehouseMap>
      </MapSection>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
`;

const EmptyText = styled.div`
  margin-top: 16px;
  font-size: 16px;
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 12px;
  color: #3b82f6;
  font-size: 24px;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
`;

const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProgressBar = styled.div`
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
`;

const CurrentTaskCard = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #3b82f6;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
`;

const CurrentTaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CurrentTaskTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TaskNumber = styled.div`
  padding: 6px 12px;
  background: #1e40af;
  color: white;
  border-radius: 8px;
  font-weight: 700;
`;

const CurrentTaskContent = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
`;

const TaskImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid white;
`;

const TaskInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TaskName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const TaskSKU = styled.div`
  font-size: 13px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
`;

const TaskQuantity = styled.div`
  font-size: 14px;
  color: #374151;
  
  strong {
    font-size: 18px;
    color: #1e40af;
  }
`;

const LocationCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const LocationIcon = styled.div<{ zone: string }>`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    const colors: any = {
      'A': '#fee2e2',
      'B': '#dbeafe',
      'C': '#d1fae5',
      'D': '#fef3c7',
      'E': '#e0e7ff'
    };
    return colors[props.zone] || '#f3f4f6';
  }};
  color: ${props => {
    const colors: any = {
      'A': '#dc2626',
      'B': '#2563eb',
      'C': '#059669',
      'D': '#d97706',
      'E': '#4f46e5'
    };
    return colors[props.zone] || '#6b7280';
  }};
  border-radius: 12px;
  font-size: 24px;
  font-weight: 700;
`;

const LocationDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LocationRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LocationLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const LocationValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const CompleteButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: #059669;
  }
`;

const TaskList = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TaskListHeader = styled.div`
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
`;

const TaskListTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const TaskItem = styled.div<{ picked: boolean; current: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  background: ${props => {
    if (props.picked) return '#f9fafb';
    if (props.current) return '#eff6ff';
    return 'white';
  }};
  border: 2px solid ${props => {
    if (props.current) return '#3b82f6';
    return '#e5e7eb';
  }};
  border-radius: 12px;
  opacity: ${props => props.picked ? 0.6 : 1};
  transition: all 0.2s;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TaskItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const TaskOrder = styled.div<{ picked: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.picked ? '#d1fae5' : '#eff6ff'};
  color: ${props => props.picked ? '#059669' : '#3b82f6'};
  border-radius: 10px;
  font-weight: 700;
  font-size: 16px;
`;

const TaskItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TaskItemName = styled.div<{ picked: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.picked ? '#6b7280' : '#111827'};
  text-decoration: ${props => props.picked ? 'line-through' : 'none'};
`;

const TaskItemMeta = styled.div`
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
`;

const TaskItemSKU = styled.div`
  font-family: 'Courier New', monospace;
`;

const TaskItemQty = styled.div`
  font-weight: 600;
`;

const TaskItemRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TaskLocation = styled.div<{ zone: string }>`
  padding: 6px 12px;
  background: ${props => {
    const colors: any = {
      'A': '#fee2e2',
      'B': '#dbeafe',
      'C': '#d1fae5',
      'D': '#fef3c7',
      'E': '#e0e7ff'
    };
    return colors[props.zone] || '#f3f4f6';
  }};
  color: ${props => {
    const colors: any = {
      'A': '#dc2626',
      'B': '#2563eb',
      'C': '#059669',
      'D': '#d97706',
      'E': '#4f46e5'
    };
    return colors[props.zone] || '#6b7280';
  }};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TaskCheckButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background: #059669;
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PickedBadge = styled.div`
  padding: 6px 12px;
  background: #d1fae5;
  color: #059669;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MapSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MapTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
`;

const WarehouseMap = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ZoneCard = styled.div<{ zone: string; current: boolean }>`
  padding: 20px;
  background: ${props => {
    const colors: any = {
      'A': '#fee2e2',
      'B': '#dbeafe',
      'C': '#d1fae5',
      'D': '#fef3c7',
      'E': '#e0e7ff'
    };
    return colors[props.zone] || '#f3f4f6';
  }};
  border: 3px solid ${props => props.current ? '#111827' : 'transparent'};
  border-radius: 12px;
  text-align: center;
  position: relative;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ZoneName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
`;

const ZoneStats = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
`;

const CurrentMarker = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 24px;
  animation: bounce 1s infinite;
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
`;

export default PickingRouteDisplay;
