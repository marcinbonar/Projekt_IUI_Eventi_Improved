import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import SideBar from '../../components/SideBar/SideBar';
import { useGetRecommendationsQuery } from '../../redux/event/eventsApi';
import { Text, Box, Flex } from '@chakra-ui/react';
import { IEvent } from '../../types/event';
import { EventCard } from '../AllEventPage/components';

const RecommendationPage: FC = () => {
  const userId = useSelector((state: RootState) => state.user.userId);

  const {
    data: recommendations = [],
    isLoading,
    isError,
    error,
  } = useGetRecommendationsQuery(userId ?? '');

  return (
    <SideBar>
      <Flex>
        <Box flex="1" p="20px">
          {isError && (
            <p>Błąd podczas pobierania rekomendacji: {error.toString()}</p>
          )}
          {!isLoading && !isError && (
            <div>
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                Na podstawie Twoich aktualnych zakupów proponujemy Ci
                następujące wydarzenia:
              </Text>
              {recommendations.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                  }}
                >
                  {recommendations.map((event: IEvent) => (
                    <EventCard key={event._id ?? event.title} event={event} />
                  ))}
                </div>
              ) : (
                <p>Brak rekomendowanych wydarzeń spełniających kryteria.</p>
              )}
            </div>
          )}
        </Box>
      </Flex>
    </SideBar>
  );
};

export default RecommendationPage;
