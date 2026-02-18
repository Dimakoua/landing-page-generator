import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleConditional } from '@/engine/actions/ConditionalAction';
import type { Action } from '@/schemas/actions';

describe('ConditionalAction', () => {
  let mockContext: any;
  let mockDispatch: any;

  beforeEach(() => {
    mockContext = {
      navigate: vi.fn(),
      getState: vi.fn(),
      setState: vi.fn(),
      formData: {},
    };
    mockDispatch = vi.fn().mockResolvedValue({ success: true });
  });

  it('should execute ifTrue action when stateEquals condition is met', async () => {
    mockContext.getState = vi.fn().mockReturnValue('premium');
    
    const ifTrueAction: Action = { type: 'log', message: 'User is premium', level: 'info' };
    const action = {
      type: 'conditional' as const,
      condition: 'stateEquals' as const,
      key: 'userTier',
      value: 'premium',
      ifTrue: ifTrueAction,
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(mockContext.getState).toHaveBeenCalledWith('userTier');
    expect(mockDispatch).toHaveBeenCalledWith(ifTrueAction);
    expect(result.success).toBe(true);
  });

  it('should execute ifFalse action when stateEquals condition is not met', async () => {
    mockContext.getState = vi.fn().mockReturnValue('basic');
    
    const ifFalseAction: Action = { type: 'log', message: 'User is not premium', level: 'info' };
    const action = {
      type: 'conditional' as const,
      condition: 'stateEquals' as const,
      key: 'userTier',
      value: 'premium',
      ifFalse: ifFalseAction,
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledWith(ifFalseAction);
    expect(result.success).toBe(true);
  });

  it('should execute ifTrue when stateExists condition is met', async () => {
    mockContext.getState = vi.fn().mockReturnValue({ name: 'John' });
    
    const ifTrueAction: Action = { type: 'log', message: 'User exists', level: 'info' };
    const action = {
      type: 'conditional' as const,
      condition: 'stateExists' as const,
      key: 'user',
      ifTrue: ifTrueAction,
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(mockContext.getState).toHaveBeenCalledWith('user');
    expect(mockDispatch).toHaveBeenCalledWith(ifTrueAction);
    expect(result.success).toBe(true);
  });

  it('should execute ifFalse when stateExists condition is not met', async () => {
    mockContext.getState = vi.fn().mockReturnValue(undefined);
    
    const ifFalseAction: Action = { type: 'log', message: 'User does not exist', level: 'info' };
    const action = {
      type: 'conditional' as const,
      condition: 'stateExists' as const,
      key: 'user',
      ifFalse: ifFalseAction,
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledWith(ifFalseAction);
    expect(result.success).toBe(true);
  });

  it('should return success without executing when no ifTrue/ifFalse actions', async () => {
    mockContext.getState = vi.fn().mockReturnValue('test');
    
    const action = {
      type: 'conditional' as const,
      condition: 'stateEquals' as const,
      key: 'status',
      value: 'test',
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ conditionMet: true, executed: false });
  });

  it('should handle custom condition (always false for now)', async () => {
    const ifFalseAction: Action = { type: 'log', message: 'Custom condition not met', level: 'info' };
    const action = {
      type: 'conditional' as const,
      condition: 'custom' as const,
      ifFalse: ifFalseAction,
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledWith(ifFalseAction);
    expect(result.success).toBe(true);
  });

  it('should return error when key is missing for stateEquals', async () => {
    const action = {
      type: 'conditional' as const,
      condition: 'stateEquals' as const,
      value: 'test',
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('key required for stateEquals condition');
  });

  it('should return error when key is missing for stateExists', async () => {
    const action = {
      type: 'conditional' as const,
      condition: 'stateExists' as const,
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('key required for stateExists condition');
  });

  it('should handle complex state values', async () => {
    mockContext.getState = vi.fn().mockReturnValue({ tier: 'gold', points: 1000 });
    
    const ifTrueAction: Action = { type: 'log', message: 'User object exists', level: 'info' };
    const action = {
      type: 'conditional' as const,
      condition: 'stateExists' as const,
      key: 'userProfile',
      ifTrue: ifTrueAction,
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledWith(ifTrueAction);
    expect(result.success).toBe(true);
  });

  it('should compare different value types correctly', async () => {
    // Test number comparison
    mockContext.getState = vi.fn().mockReturnValue(42);
    
    const action = {
      type: 'conditional' as const,
      condition: 'stateEquals' as const,
      key: 'count',
      value: 42,
      ifTrue: { type: 'log', message: 'Match', level: 'info' } as Action,
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(result.success).toBe(true);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should execute ifTrue when stateMatches pattern is matched', async () => {
    mockContext.getState = vi.fn().mockReturnValue('iPhone');
    
    const ifTrueAction: Action = { type: 'log', message: 'Device matched', level: 'info' };
    const action = {
      type: 'conditional' as const,
      condition: 'stateMatches' as const,
      key: 'device',
      pattern: '^iPhone',
      ifTrue: ifTrueAction,
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledWith(ifTrueAction);
    expect(result.success).toBe(true);
  });

  it('should execute ifFalse when stateMatches pattern is not matched', async () => {
    mockContext.getState = vi.fn().mockReturnValue('Android');
    
    const ifFalseAction: Action = { type: 'log', message: 'Device not matched', level: 'info' };
    const action = {
      type: 'conditional' as const,
      condition: 'stateMatches' as const,
      key: 'device',
      pattern: '^iPhone',
      ifFalse: ifFalseAction,
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledWith(ifFalseAction);
    expect(result.success).toBe(true);
  });

  it('should support regex flags for stateMatches (case-insensitive)', async () => {
    mockContext.getState = vi.fn().mockReturnValue('iPhone');
    
    const ifTrueAction: Action = { type: 'log', message: 'Case-insensitive match', level: 'info' };
    const action = {
      type: 'conditional' as const,
      condition: 'stateMatches' as const,
      key: 'device',
      pattern: 'iphone',
      flags: 'i',
      ifTrue: ifTrueAction,
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledWith(ifTrueAction);
    expect(result.success).toBe(true);
  });

  it('should coerce non-string state values to string for matching', async () => {
    mockContext.getState = vi.fn().mockReturnValue(42);
    
    const ifTrueAction: Action = { type: 'log', message: 'Number matched', level: 'info' };
    const action = {
      type: 'conditional' as const,
      condition: 'stateMatches' as const,
      key: 'count',
      pattern: '^4',
      ifTrue: ifTrueAction,
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledWith(ifTrueAction);
    expect(result.success).toBe(true);
  });

  it('should return error when pattern is missing for stateMatches', async () => {
    const action = {
      type: 'conditional' as const,
      condition: 'stateMatches' as const,
      key: 'status',
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('pattern required for stateMatches condition');
  });

  it('should handle action dispatch errors', async () => {
    mockContext.getState = vi.fn().mockReturnValue('test');
    mockDispatch.mockRejectedValue(new Error('Dispatch failed'));
    
    const action = {
      type: 'conditional' as const,
      condition: 'stateEquals' as const,
      key: 'status',
      value: 'test',
      ifTrue: { type: 'log', message: 'Test', level: 'info' } as Action,
    };

    const result = await handleConditional(action, mockContext, mockDispatch);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Dispatch failed');
  });
});
