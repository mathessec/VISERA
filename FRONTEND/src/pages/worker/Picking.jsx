import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import SummaryCard from '../../components/picking/SummaryCard';
import PickListItem from '../../components/picking/PickListItem';
import PickingDetailModal from '../../components/picking/PickingDetailModal';
import { getPickingItems, getPickingStatistics, completePicking } from '../../services/taskService';
import { getUserId } from '../../services/authService';
import { groupTasksByShipment } from '../../utils/pickingUtils';

export default function Picking() {
  const [pickingItems, setPickingItems] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedPickList, setSelectedPickList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const userId = parseInt(getUserId());
      
      const [itemsData, statsData] = await Promise.all([
        getPickingItems(userId),
        getPickingStatistics(userId)
      ]);
      
      setPickingItems(itemsData);
      setStatistics(statsData);
    } catch (err) {
      setError('Failed to load picking data');
      console.error('Error fetching picking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPicking = (pickList) => {
    setSelectedPickList(pickList);
  };

  const handleCompletePicking = async (taskId) => {
    try {
      const userId = parseInt(getUserId());
      await completePicking(taskId, userId);
      // Refresh data after completion
      await fetchData();
    } catch (err) {
      throw err; // Let the modal handle the error
    }
  };

  const handleCloseModal = () => {
    setSelectedPickList(null);
    fetchData(); // Refresh data when modal closes
  };

  if (loading) return <Loading text="Loading picking operations..." />;

  // Group tasks by shipment
  const pickLists = groupTasksByShipment(pickingItems);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Outbound Picking</h1>
        <p className="text-gray-600 mt-1">Pick and verify items for outbound shipments</p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Active Pick Lists"
            value={statistics.activePickListsCount || 0}
            icon={Package}
            color="blue"
          />
          <SummaryCard
            title="Items to Pick"
            value={statistics.itemsToPickCount || 0}
            icon={Clock}
            color="orange"
          />
          <SummaryCard
            title="Picked Today"
            value={statistics.pickedTodayCount || 0}
            icon={CheckCircle}
            color="green"
          />
          <SummaryCard
            title="Ready to Ship"
            value={statistics.readyToShipCount || 0}
            icon={Truck}
            color="purple"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Active Pick Lists */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Pick Lists</CardTitle>
            </CardHeader>
            <CardContent>
              {pickLists.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No pick lists available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pickLists.map((pickList) => (
                    <PickListItem
                      key={pickList.shipmentId}
                      pickList={pickList}
                      currentUserId={parseInt(getUserId())}
                      onStartPicking={handleStartPicking}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Getting Started */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedPickList ? (
                <div className="text-center py-12">
                  <Package size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-2">Select a pick list to begin</p>
                  <p className="text-sm text-gray-400">
                    Choose a pick list from the left to start picking items
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {selectedPickList.shipmentId ? `PL-${new Date().getFullYear()}-${String(selectedPickList.shipmentId).padStart(3, '0')}` : 'Selected Pick List'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedPickList.destination || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedPickList.tasks.length} items to pick
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click "Start Picking" on the pick list card to begin the picking process.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Picking Detail Modal */}
      {selectedPickList && (
        <PickingDetailModal
          isOpen={!!selectedPickList}
          onClose={handleCloseModal}
          pickList={selectedPickList}
          onComplete={handleCompletePicking}
        />
      )}
    </div>
  );
}
