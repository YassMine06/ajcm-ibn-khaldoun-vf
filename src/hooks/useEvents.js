import { useState, useEffect, useCallback } from 'react';
import eventService from '../api/eventService';
import useAsync from './useAsync';

/**
 * Custom hook for managing events state and operations.
 */
export const useEvents = () => {
  const { execute: fetchEvents, isLoading, error, value: events } = useAsync(eventService.getAll);
  const [localEvents, setLocalEvents] = useState([]);

  // Load events on mount
  useEffect(() => {
    fetchEvents().then(data => setLocalEvents(data)).catch(() => {});
  }, [fetchEvents]);

  const refresh = useCallback(async () => {
    const data = await fetchEvents();
    setLocalEvents(data);
  }, [fetchEvents]);

  const deleteEvent = async (id) => {
    await eventService.delete(id);
    setLocalEvents(prev => prev.filter(e => e.folder !== id));
  };

  const saveEvent = async (id, data) => {
    if (id && localEvents.some(e => e.folder === id)) {
      const updated = await eventService.update(id, data);
      setLocalEvents(prev => prev.map(e => e.folder === id ? updated : e));
    } else {
      const created = await eventService.create(data);
      setLocalEvents(prev => [...prev, created]);
    }
  };

  return {
    events: localEvents,
    isLoading,
    error,
    refresh,
    deleteEvent,
    saveEvent
  };
};

export default useEvents;
