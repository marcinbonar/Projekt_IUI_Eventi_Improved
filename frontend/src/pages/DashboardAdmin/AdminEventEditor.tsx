import { Box, Button, Spinner, Table, Tbody, Th, Thead, Tr } from '@chakra-ui/react';
import React, { FC, useState } from 'react';

import SideBarForAdmin from '../../components/SideBar/SideBarForAdmin';
import EventRow from './components/EventRow/EventRow';
import AddEventModal from './components/AddEventModal';
import { useDeleteEventMutation, useGetAdminEventsQuery } from '../../redux/event/eventsApi';
import useApplicationToast from '../../hooks/useApplicationToast';

const AdminEventEditor: FC = () => {
  const { data: events, isLoading: isEventLoading, isSuccess, refetch } = useGetAdminEventsQuery();
  const [deleteEvent, { isLoading: isDeleteLoading }] = useDeleteEventMutation();
  const { toastError, toastSuccess } = useApplicationToast();

  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  const handleDeleteEvent = (eventId: string) => {
    try {
      deleteEvent(eventId);
      toastSuccess({
        title: 'Status',
        description: 'Wydarzenie zostało usunięte.',
      });
    } catch (error) {
      toastError({
        title: 'Status',
        description: 'Nie udało się usunąć wydarzenia.',
      });
    }
  };

  return (
    <SideBarForAdmin>
      <Box p={4} overflowX="auto">
        <Button colorScheme="green" onClick={handleOpenModal} mb={4}>
          Dodaj wydarzenie
        </Button>

        <AddEventModal isOpen={isOpen} onClose={handleCloseModal} />

        {isEventLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <Spinner size="xl" color="teal.500" />
          </Box>
        ) : (
          <Table variant="striped" colorScheme="teal">
            <Thead>
              <Tr>
                <Th>Tytuł</Th>
                <Th>Opis</Th>
                <Th>Obraz</Th>
                <Th>Data rozpoczęcia</Th>
                <Th>Data zakończenia</Th>
                <Th>Lokalizacja</Th>
                <Th>Kategoria</Th>
                <Th>Dostępne bilety</Th>
                <Th>Cena biletu</Th>
                <Th>Akcje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(events || []).map(event => (
                <EventRow
                  key={event._id}
                  event={event}
                  onDelete={() => handleDeleteEvent(event._id as string)}
                />
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </SideBarForAdmin>
  );
};

export default AdminEventEditor;
