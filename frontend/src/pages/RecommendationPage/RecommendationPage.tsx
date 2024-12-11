import React, { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import SideBar from '../../components/SideBar/SideBar';
import { useGetRecommendationsQuery } from '../../redux/event/eventsApi';
import { Text, Box, Flex, Spinner, Center, VStack, Heading, Icon } from '@chakra-ui/react';
import { IEvent } from '../../types/event';
import EventCard from '../AllEventPage/components/EventCard';
import { FaRegSmileWink } from 'react-icons/fa';

const RecommendationPage: FC = () => {
  const userId = useSelector((state: RootState) => state.user.userId);

  const {
    data: recommendations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetRecommendationsQuery(userId ?? '');

  // Logowanie danych do debugowania
  useEffect(() => {
    console.log('userId:', userId);
    console.log('recommendations:', recommendations);
    if (error) {
      console.log('error:', error);
    }
  }, [userId, recommendations, error]);

  useEffect(() => {
    refetch(); // Wymuszenie ponownego pobrania danych przy montażu
  }, [refetch]);

  return (
    <SideBar>
      <Flex>
        <Box flex="1" p="20px">
          {isLoading && (
            <Center mt="50px">
              <VStack spacing={4}>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="teal.400"
                  size="xl"
                />
                <Heading size="md" color="teal.600">
                  Przygotowujemy Twoje rekomendacje
                </Heading>
                <Text color="gray.500">
                  Chwilka cierpliwości, szukamy najlepszych wydarzeń dla Ciebie!
                </Text>
              </VStack>
            </Center>
          )}
          {isError && (
            <Center mt="50px">
              <VStack spacing={4}>
                <Icon as={FaRegSmileWink} w={10} h={10} color="red.500" />
                <Heading size="md" color="red.500">
                  Ups! Coś poszło nie tak.
                </Heading>
                <Text color="gray.500">Nie udało się pobrać rekomendacji</Text>
              </VStack>
            </Center>
          )}
          {!isLoading && !isError && (
            <div>
              <Text fontSize="2xl" fontWeight="bold" mb={6} color="teal.600">
                Polecane dla Ciebie
              </Text>
              {recommendations.length > 0 ? (
                <Flex wrap="wrap" gap="20px">
                  {recommendations.map((event: IEvent) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </Flex>
              ) : (
                <Center mt="50px">
                  <VStack spacing={4}>
                    <Icon as={FaRegSmileWink} w={10} h={10} color="gray.500" />
                    <Heading size="md" color="gray.600">
                      Brak rekomendacji
                    </Heading>
                    <Text color="gray.500">
                      Obecnie nie mamy dla Ciebie nowych propozycji. Sprawdź później!
                    </Text>
                  </VStack>
                </Center>
              )}
            </div>
          )}
        </Box>
      </Flex>
    </SideBar>
  );
};

export default RecommendationPage;
