import { Button, HStack, Td, Tr } from '@chakra-ui/react';
import React, { FC, useState, useEffect } from 'react';

import useApplicationToast from '../../../../hooks/useApplicationToast';
import { UserRowProps } from './types';

const UserRow: FC<UserRowProps> = ({
  name,
  surname,
  email,
  isBlocked: isBlockedProp,
  onBlock,
  onUnblock,
}) => {
  const { toastError, toastSuccess } = useApplicationToast();
  const [isBlocked, setIsBlocked] = useState(isBlockedProp);

  useEffect(() => {
    setIsBlocked(isBlockedProp); // Synchronizuj lokalny stan z wartością początkową
  }, [isBlockedProp]);

  const handleBlock = async () => {
    try {
      await onBlock();
      setIsBlocked(true); // Zaktualizuj lokalny stan
      toastSuccess({
        title: 'Status',
        description: 'Użytkownik został zablokowany',
      });
    } catch (error) {
      toastError({
        title: 'Status',
        description: 'Nie udało się zablokować użytkownika',
      });
    }
  };

  const handleUnblock = async () => {
    try {
      await onUnblock();
      setIsBlocked(false); // Zaktualizuj lokalny stan
      toastSuccess({
        title: 'Status',
        description: 'Użytkownik został odblokowany',
      });
    } catch (error) {
      toastError({ title: 'Status', description: 'Wystąpił błąd' });
    }
  };

  return (
    <Tr>
      <Td>{name}</Td>
      <Td>{surname}</Td>
      <Td>{email}</Td>
      <Td>
        <HStack spacing={4}>
          {isBlocked ? (
            <Button size="sm" onClick={handleUnblock} colorScheme="teal">
              Odblokuj
            </Button>
          ) : (
            <Button size="sm" onClick={handleBlock} colorScheme="red">
              Zablokuj
            </Button>
          )}
        </HStack>
      </Td>
    </Tr>
  );
};

export default UserRow;
