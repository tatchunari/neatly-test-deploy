"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HotelInfo {
  name: string;
  description: string;
  logoUrl: string;
}

interface HotelInfoContextType {
  hotelInfo: HotelInfo;
  loading: boolean;
  error: string | null;
  updateHotelInfo: (data: Partial<HotelInfo>) => Promise<boolean>;
  refreshHotelInfo: () => Promise<void>;
}

const HotelInfoContext = createContext<HotelInfoContextType | undefined>(undefined);

interface HotelInfoProviderProps {
  children: ReactNode;
}

export function HotelInfoProvider({ children }: HotelInfoProviderProps) {
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>({
    name: "Neatly Hotel",
    description: `Set in Bangkok, Thailand, Neatly Hotel offers 5-star accommodation with an outdoor pool, kids' club, sports facilities and a fitness centre. There is also a spa, an indoor pool and saunas.

All units at the hotel are equipped with a seating area, a flat-screen TV with satellite channels, a dining area and a private bathroom with free toiletries, a bathtub and a hairdryer. Every room in Neatly Hotel features a furnished balcony. Some rooms are equipped with a coffee machine.

Free WiFi and entertainment facilities are available at property and also rentals are provided to explore the area.`,
    logoUrl: "/logo.png"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันดึงข้อมูลโรงแรม
  const fetchHotelInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/hotel-info');
      const result = await response.json();
      
      if (result.success) {
        setHotelInfo(result.data);
      } else {
        setError(result.message || 'Failed to fetch hotel information');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching hotel info:', err);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันอัปเดตข้อมูลโรงแรม
  const updateHotelInfo = async (data: Partial<HotelInfo>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/hotel-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setHotelInfo(result.data);
        return true;
      } else {
        setError(result.message || 'Failed to update hotel information');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error updating hotel info:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันรีเฟรชข้อมูล
  const refreshHotelInfo = async () => {
    await fetchHotelInfo();
  };

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchHotelInfo();
  }, []);

  const value: HotelInfoContextType = {
    hotelInfo,
    loading,
    error,
    updateHotelInfo,
    refreshHotelInfo,
  };

  return (
    <HotelInfoContext.Provider value={value}>
      {children}
    </HotelInfoContext.Provider>
  );
}

// Custom hook สำหรับใช้ context
export function useHotelInfo() {
  const context = useContext(HotelInfoContext);
  if (context === undefined) {
    throw new Error('useHotelInfo must be used within a HotelInfoProvider');
  }
  return context;
}
