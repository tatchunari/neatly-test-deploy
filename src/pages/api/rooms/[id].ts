// pages/api/rooms/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Room ID is required'
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetRoom(id, res);
      case 'PUT':
        return await handleUpdateRoom(id, req, res);
      case 'DELETE':
        return await handleDeleteRoom(id, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// GET /api/rooms/[id] - Get room by ID
async function handleGetRoom(id: string, res: NextApiResponse<ApiResponse>) {
  try {
    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch room'
    });
  }
}

// PUT /api/rooms/[id] - Update room
async function handleUpdateRoom(id: string, req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    const updateData = req.body;

    // Add updated timestamp
    const payload = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    const { data: room, error } = await supabase
      .from('rooms')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: room,
      message: 'Room updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update room'
    });
  }
}

// DELETE /api/rooms/[id] - Delete room
async function handleDeleteRoom(id: string, res: NextApiResponse<ApiResponse>) {
  try {
    // First get the room to access image URLs for cleanup
    const { data: room } = await supabase
      .from('rooms')
      .select('main_image_url, gallery_images')
      .eq('id', id)
      .single();

    // Delete the room from database
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Clean up images from storage (optional - can be done in background)
    if (room) {
      try {
        const imagesToDelete: string[] = [];
        
        // Add main image path
        if (room.main_image_url) {
          const mainImagePath = room.main_image_url.split('/').slice(-2).join('/');
          imagesToDelete.push(mainImagePath);
        }
        
        // Add gallery image paths
        room.gallery_images?.forEach((url: string) => {
          const imagePath = url.split('/').slice(-2).join('/');
          imagesToDelete.push(imagePath);
        });

        // Delete images from storage
        if (imagesToDelete.length > 0) {
          await supabase.storage
            .from('room-images')
            .remove(imagesToDelete);
        }
      } catch (storageError) {
        // Log but don't fail the request if storage cleanup fails
        console.error('Failed to cleanup storage:', storageError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete room'
    });
  }
}