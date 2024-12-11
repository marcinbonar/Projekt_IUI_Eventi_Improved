import { VStack, Spinner, Text } from '@chakra-ui/react';
import React, { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';

import SideBar from '../../components/SideBar/SideBar';
import { RootState } from '../../redux/store';
import { useGetUserSignedUpEventsQuery } from '../../redux/user/userApi';
import EventCard from './components/EventCard/EventCard';

const UserAttendEvent: FC = () => {
  const userId = useSelector((state: RootState) => state.user.userId);
  const { data: events, isLoading, isError, refetch } = useGetUserSignedUpEventsQuery(userId ?? '');

  useEffect(() => {
    refetch();
  }, [userId, refetch]);

  return (
    <SideBar>
      <VStack spacing={4} p={4} align="center">
        {isLoading ? (
          <>
            <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" />
            <Text fontSize="lg" ml={4}>
              Ładowanie wydarzeń...
            </Text>
          </>
        ) : isError ? (
          <Text fontSize="lg" color="red.500">
            Error loading events
          </Text>
        ) : !events || events.length === 0 ? (
          <Text fontSize="lg" color="teal.500">
            Nie zapisałeś się na żadne wydarzenie.
          </Text>
        ) : (
          events.map(event => <EventCard key={event.eventId} event={event} />)
        )}
      </VStack>
    </SideBar>
  );
};

export default UserAttendEvent;
