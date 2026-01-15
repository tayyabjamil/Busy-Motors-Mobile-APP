import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  AppState,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {hp, wp} from '../../Helper/Responsive';
import {Fonts} from '../../Helper/Fonts';
import Header from '../../Components/Header';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {getNotificationsAPI} from '../../redux/api';
import Colors from '../../Helper/Colors';

interface Notification {
  _id: string;
  title: string;
  body: string;
  createdAt: string;
  read?: boolean;
}

const Notifications = () => {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  const {token} = useSelector((state: any) => state.auth);
  const refreshTrigger = useSelector((state: any) => state.notifications?.refreshTrigger || 0);
  const appState = useRef(AppState.currentState);
  const LIMIT = 20;

  // Fetch notifications
  const fetchNotifications = async (pageNum: number, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      const response = await getNotificationsAPI(pageNum, LIMIT, token);
      console.log('📬 Notifications Response:', response);
      const notifications = response?.data || response?.notifications || [];
      const pagination = response?.pagination || {};
      
      if (isRefresh || pageNum === 1) {
        setData(notifications);
      } else {
        setData(prev => [...prev, ...notifications]);
      }

      // Check if there are more pages
      const totalPages = pagination?.totalPages || 1;
      const currentPage = pagination?.currentPage || pageNum;
      setHasMore(currentPage < totalPages);
      setPage(pageNum);

    } catch (error: any) {
      console.log('❌ Error fetching notifications:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isFocused && token) {
      fetchNotifications(1);
    }
  }, [isFocused, token]);

  // Refresh when push notification is received (refreshTrigger changes)
  useEffect(() => {
    if (refreshTrigger > 0 && token) {
      console.log('📬 Push notification received, refreshing notifications list...');
      fetchNotifications(1, true);
    }
  }, [refreshTrigger]);

  // Refresh when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isFocused &&
        token
      ) {
        console.log('📱 App came to foreground, refreshing notifications...');
        fetchNotifications(1, true);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isFocused, token]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setHasMore(true);
    fetchNotifications(1, true);
  }, [token]);

  // Load more on scroll
  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      fetchNotifications(page + 1);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({item, index}: {item: Notification; index: number}) => (
    <View style={[styles.notificationCard, index > 0 && styles.borderTop]}>
      <View style={styles.notificationText}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>{item.body}</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        navigation={navigation}
        showBackButton
        showNotification={false}
        textData={'Notifications'}
      />

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Image
                  source={require('../../assets/bellEmpty.png')}
                  style={styles.emptyImage}
                />
              </View>
              <Text style={styles.emptyTitle}>No Notifications Yet</Text>
              <Text style={styles.emptyDescription}>
                You're all caught up! We'll notify you when there's something new
                — like updates on your saved cars or subscription alerts.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  list: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    flexGrow: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    paddingVertical: hp(2),
    paddingHorizontal: wp(2),
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  notificationText: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  title: {
    fontSize: wp(3.8),
    fontWeight: '600',
    fontFamily: Fonts.bold,
    color: '#1A1A1A',
    flex: 1,
    marginRight: wp(2),
  },
  description: {
    fontSize: wp(3.3),
    fontFamily: Fonts.regular,
    color: '#666',
    lineHeight: hp(2.2),
  },
  time: {
    fontSize: wp(3),
    fontFamily: Fonts.regular,
    color: '#999',
  },
  unreadDot: {
    position: 'absolute',
    top: wp(4),
    right: wp(4),
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    backgroundColor: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(1.5),
    fontSize: wp(3.5),
    fontFamily: Fonts.regular,
    color: '#666',
  },
  footerLoader: {
    paddingVertical: hp(2),
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(20),
    paddingHorizontal: wp(10),
  },
  emptyIconContainer: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(3),
  },
  emptyImage: {
    width: wp(11),
    height: wp(11),
    resizeMode: 'contain',
    tintColor: '#9E9E9E',
  },
  emptyTitle: {
    fontSize: wp(5.5),
    fontWeight: '700',
    fontFamily: Fonts.bold,
    color: '#1A1A1A',
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: wp(3.8),
    fontFamily: Fonts.regular,
    color: '#757575',
    textAlign: 'center',
    lineHeight: hp(2.8),
    paddingHorizontal: wp(5),
  },
});

export default Notifications;
