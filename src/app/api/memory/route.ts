// 🎵 TypeMate Phase 1: 記憶管理API
// CRUD操作とClaude API統合準備

import { NextRequest, NextResponse } from 'next/server';
import { memoryManager } from '@/lib/memory-manager';

// Phase 1: 記憶取得 (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const conversationId = searchParams.get('conversationId') || undefined;
    const type = searchParams.get('type') || 'short-term';

    switch (type) {
      case 'short-term':
        const shortTerm = await memoryManager.getShortTermMemory(userId, conversationId);
        return NextResponse.json({
          success: true,
          data: shortTerm
        });

      case 'progress':
        const progress = await memoryManager.getMemoryProgress(userId);
        return NextResponse.json({
          success: true,
          data: progress
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type parameter'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Memory GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Phase 1: 記憶保存 (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messageContent,
      messageRole,
      archetype,
      conversationId,
      userId,
      userName,
      relationshipLevel = 1
    } = body;

    // バリデーション
    if (!messageContent || !messageRole || !archetype || !conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    if (!['user', 'ai'].includes(messageRole)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid message role'
      }, { status: 400 });
    }

    // 記憶保存
    const memory = await memoryManager.saveConversationMemory(
      messageContent,
      messageRole,
      archetype,
      conversationId,
      userId,
      userName
    );

    if (!memory) {
      return NextResponse.json({
        success: false,
        error: 'Failed to save memory'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: memory
    });

  } catch (error) {
    console.error('Memory POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Phase 1: 記憶更新 (PUT)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, value } = body;

    if (!userId || !type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    let success = false;

    switch (type) {
      case 'user-name':
        if (!value || typeof value !== 'string') {
          return NextResponse.json({
            success: false,
            error: 'Invalid user name'
          }, { status: 400 });
        }
        success = await memoryManager.updateUserName(userId, value);
        break;

      case 'relationship-level':
        if (!value || typeof value !== 'number' || value < 1 || value > 6) {
          return NextResponse.json({
            success: false,
            error: 'Invalid relationship level'
          }, { status: 400 });
        }
        success = await memoryManager.updateRelationshipLevel(userId, value);
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid update type'
        }, { status: 400 });
    }

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Update failed'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${type} updated successfully`
    });

  } catch (error) {
    console.error('Memory PUT error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Phase 1: バッチ保存 (複数メッセージ一括保存)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userId, archetype, conversationId } = body;

    if (!Array.isArray(messages) || !archetype || !conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid batch data'
      }, { status: 400 });
    }

    const results = [];
    
    for (const msg of messages) {
      const { content, role, userName } = msg;
      
      if (!content || !role || !['user', 'ai'].includes(role)) {
        continue; // Skip invalid messages
      }

      const memory = await memoryManager.saveConversationMemory(
        content,
        role,
        archetype,
        conversationId,
        userId,
        userName
      );

      if (memory) {
        results.push(memory);
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      saved: results.length,
      total: messages.length
    });

  } catch (error) {
    console.error('Memory PATCH error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}