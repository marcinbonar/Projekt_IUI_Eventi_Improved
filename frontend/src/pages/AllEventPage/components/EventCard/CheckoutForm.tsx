import React, { FC, useState } from 'react';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Box,
  Flex,
  Stack,
  Image,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';

import useApplicationToast from '../../../../hooks/useApplicationToast';
import { usePayWithStripeMutation } from '../../../../redux/event/eventsApi';

interface CheckoutFormProps {
  eventId?: string;
  userId?: string | null;
  closeStripeModal: () => void;
}

const CheckoutForm: FC<CheckoutFormProps> = ({ eventId, userId, closeStripeModal }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [payWithStripe, { isLoading: isPaymentLoading }] = usePayWithStripeMutation();
  const { toastError, toastSuccess } = useApplicationToast();

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [cardError, setCardError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !userId || !eventId) return;

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) return;

    try {
      const { token, error } = await stripe.createToken(cardNumberElement);

      if (error) {
        setCardError(error.message || 'Wystąpił błąd podczas tworzenia tokenu');
        return;
      }

      if (!token) {
        setCardError('Nie udało się uzyskać tokenu płatności');
        return;
      }

      await payWithStripe({
        userId,
        eventId,
        stripeToken: token.id,
      }).unwrap();

      closeStripeModal();
      toastSuccess({
        title: 'Zapłacono',
        description: 'Kupiłeś bilet',
      });
    } catch (error: any) {
      toastError({
        title: 'Wystąpił błąd',
        description: 'Spróbuj ponownie później',
      });
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    closeStripeModal();
  };

  if (!eventId || !userId) return null;

  return (
    <Modal isOpen={isModalOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent borderRadius="md" overflow="hidden">
        <ModalCloseButton />
        <Box bg="teal.500" color="white" py={6} textAlign="center">
          <Image
            src="https://logos-world.net/wp-content/uploads/2022/12/Stripe-Emblem.png"
            alt="Stripe Logo"
            mx="auto"
            mb={2}
            height="50px"
          />
          <Heading as="h2" size="lg">
            Płatność kartą
          </Heading>
        </Box>
        <ModalBody padding={6}>
          <form onSubmit={onSubmit}>
            <Stack spacing={4}>
              <FormControl isInvalid={!!cardError}>
                <FormLabel>Numer karty</FormLabel>
                <Box padding="2" border="1px solid" borderColor="gray.300" borderRadius="md">
                  <CardNumberElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          letterSpacing: '0.025em',
                          fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                </Box>
              </FormControl>
              <Flex justifyContent="space-between">
                <FormControl width="48%">
                  <FormLabel>Data ważności</FormLabel>
                  <Box padding="2" border="1px solid" borderColor="gray.300" borderRadius="md">
                    <CardExpiryElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            letterSpacing: '0.025em',
                            fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#9e2146',
                          },
                        },
                      }}
                    />
                  </Box>
                </FormControl>
                <FormControl width="48%">
                  <FormLabel>CVC</FormLabel>
                  <Box padding="2" border="1px solid" borderColor="gray.300" borderRadius="md">
                    <CardCvcElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            letterSpacing: '0.025em',
                            fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#9e2146',
                          },
                        },
                      }}
                    />
                  </Box>
                </FormControl>
              </Flex>
              {cardError && <FormErrorMessage>{cardError}</FormErrorMessage>}
              <Button
                type="submit"
                colorScheme="teal"
                width="100%"
                disabled={!stripe || isPaymentLoading}
                isLoading={isPaymentLoading}
                mt={4}
              >
                Zapłać
              </Button>
            </Stack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CheckoutForm;
