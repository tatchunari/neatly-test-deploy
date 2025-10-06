import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BookingLayout } from "@/components/customer/booking/BookingLayout";
import { BookingStepper } from "@/components/customer/booking/BookingStepper";
import { BookingSummary } from "@/components/customer/booking/BookingSummary";
import { BookingPolicies } from "@/components/customer/booking/BookingPolicies";
import { BasicInfoForm } from "@/components/customer/booking/forms/BasicInfoForm";
import { SpecialRequestForm } from "@/components/customer/booking/forms/SpecialRequestForm";
import { PaymentMethodForm } from "@/components/customer/booking/forms/PaymentMethodForm";
import { PaymentSuccessModal } from "@/components/customer/booking/modals/PaymentSuccessModal";
import { PaymentFailedModal } from "@/components/customer/booking/modals/PaymentFailedModal";
import {
  BookingStep,
  GuestInfo,
  SpecialRequest,
  PaymentMethod,
  CreditCardDetails,
  BookingFormData,
  BookingConfirmation,
  BookingError,
  BookingCalculation,
  Booking,
  Payment,
} from "@/types/booking";
import { SPECIAL_REQUESTS } from "@/constants/booking";
import {
  calculateBookingTotal,
  calculateNights,
  formatCurrency,
} from "@/utils/bookingUtils";
import { BookingService } from "@/services/bookingService";
import { PaymentService } from "@/services/paymentService";
import { PromotionService } from "@/services/promotionService";
import { useProfile } from "@/hooks/useProfile"; // เพิ่ม useProfile
import Layout from "@/components/Layout";

export default function BookingPage() {
  const router = useRouter();
  const { roomId, checkIn, checkOut, guests } = router.query;
  const { profile, isLoading: profileLoading } = useProfile(); // ดึงข้อมูล profile

  // Step management
  const [currentStep, setCurrentStep] = useState<BookingStep>("basic_info");
  const [loading, setLoading] = useState(false);

  // Form data - เริ่มต้นเป็นค่าว่าง
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    country: "",
  });

  const [specialRequests, setSpecialRequests] =
    useState<SpecialRequest[]>(SPECIAL_REQUESTS);
  const [additionalRequest, setAdditionalRequest] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("credit_card");
  const [creditCardDetails, setCreditCardDetails] = useState<CreditCardDetails>(
    {
      cardNumber: "",
      cardOwner: "",
      expiryDate: "",
      cvc: "",
    }
  );

  const [promoCode, setPromoCode] = useState("");
  const [promoCodeApplied, setPromoCodeApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [paymentError, setPaymentError] = useState<BookingError | null>(null);
  const [bookingConfirmation, setBookingConfirmation] =
    useState<BookingConfirmation | null>(null);

  // Room info (mock data - should come from API)
  const roomInfo = {
    name: "Deluxe Ocean View",
    price: 2500,
    image: "/image/deluxe.jpg",
  };

  // Calculations
  const nights = calculateNights(checkIn as string, checkOut as string);
  const selectedSpecialRequests = specialRequests.filter((req) => req.selected);
  const calculation = calculateBookingTotal(
    roomInfo.price,
    nights,
    selectedSpecialRequests,
    promoDiscount
  );

  // Timer
  const [timeLeft, setTimeLeft] = useState({ minutes: 60, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.minutes === 0 && prev.seconds === 0) {
          // Booking expired
          router.push("/customer/search-result");
          return { minutes: 0, seconds: 0 };
        }

        if (prev.seconds === 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }

        return { minutes: prev.minutes, seconds: prev.seconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  // อัปเดต guestInfo เมื่อ profile โหลดเสร็จ
  useEffect(() => {
    const updateGuestInfo = async () => {
      if (profile) {
        // ดึง email จาก auth user
        const { supabase } = await import("@/lib/supabaseClient");
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const newGuestInfo = {
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: user?.email || "",
          phone: profile.phone || "",
          dateOfBirth: profile.date_of_birth || "",
          country: profile.country || "",
        };

        setGuestInfo(newGuestInfo);
      } else if (!profileLoading) {
        // ถ้าไม่มี profile ให้ดึงแค่ email จาก auth
        const { supabase } = await import("@/lib/supabaseClient");
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.email) {
          setGuestInfo((prev) => ({
            ...prev,
            email: user.email || "",
          }));
        }
      }
    };

    updateGuestInfo();
  }, [profile, profileLoading]);

  const steps = [
    { id: "basic_info" as BookingStep, label: "Basic Information", number: 1 },
    {
      id: "special_request" as BookingStep,
      label: "Special Request",
      number: 2,
    },
    { id: "payment_method" as BookingStep, label: "Payment Method", number: 3 },
  ];

  // Navigation handlers
  const handleNext = () => {
    switch (currentStep) {
      case "basic_info":
        setCurrentStep("special_request");
        break;
      case "special_request":
        setCurrentStep("payment_method");
        break;
      case "payment_method":
        handleConfirmBooking();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "basic_info":
        // กลับไปหน้า search result
        router.push("/customer/search-result");
        break;
      case "special_request":
        setCurrentStep("basic_info");
        break;
      case "payment_method":
        setCurrentStep("special_request");
        break;
    }
  };

  // Promotion code handler
  const handlePromoCodeApply = async () => {
    if (!promoCode.trim()) return;

    try {
      const result = await PromotionService.validatePromotionCode(
        promoCode,
        roomId as string,
        checkIn as string,
        checkOut as string
      );

      if (result.isValid && result.promotionCode) {
        const discount = PromotionService.calculateDiscount(
          calculation.subtotal + calculation.specialRequestsTotal,
          result.promotionCode
        );
        setPromoDiscount(discount);
        setPromoCodeApplied(true);
      } else {
        alert(result.error || "Invalid promotion code");
      }
    } catch (error) {
      console.error("Error applying promotion code:", error);
      alert("Failed to apply promotion code");
    }
  };

  // Booking confirmation handler
  const handleConfirmBooking = async () => {
    setLoading(true);

    try {
      const bookingData: BookingFormData = {
        guestInfo,
        roomId: roomId as string,
        checkIn: checkIn as string,
        checkOut: checkOut as string,
        guests: parseInt(guests as string),
        specialRequests: selectedSpecialRequests,
        additionalRequests: additionalRequest,
        paymentMethod,
        creditCardDetails:
          paymentMethod === "credit_card" ? creditCardDetails : undefined,
        promoCode: promoCodeApplied ? promoCode : undefined,
      };

      // Create booking
      const bookingResponse = await BookingService.createBooking(bookingData);

      if (bookingResponse.success && bookingResponse.data) {
        const booking = bookingResponse.data as Booking;

        // Process payment
        const paymentResponse = await PaymentService.createPayment(
          booking.id,
          calculation.total,
          paymentMethod,
          paymentMethod === "credit_card" ? creditCardDetails : undefined
        );

        if (paymentResponse.success && paymentResponse.data) {
          const payment = paymentResponse.data as Payment;

          // Process payment based on method
          let processResponse;
          if (paymentMethod === "credit_card") {
            processResponse = await PaymentService.processStripePayment(
              payment.id,
              "mock_stripe_payment_intent_id"
            );
          } else if (paymentMethod === "cash") {
            processResponse = await PaymentService.processCashPayment(
              payment.id
            );
          } else {
            // For bank transfer and promptpay, mark as pending
            processResponse = { success: true, data: payment };
          }

          if (processResponse.success) {
            // Show success modal
            setBookingConfirmation({
              bookingId: booking.id,
              confirmationNumber: `CONF-${booking.id.slice(-8).toUpperCase()}`,
              status: "confirmed",
              paymentStatus:
                paymentMethod === "credit_card" ? "completed" : "pending",
              total: calculation.total,
              currency: "THB",
              checkIn: checkIn as string,
              checkOut: checkOut as string,
              roomType: roomInfo.name,
              guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
              email: guestInfo.email,
            });
            setShowSuccessModal(true);
          } else {
            throw new Error("Payment processing failed");
          }
        } else {
          throw new Error("Payment creation failed");
        }
      } else {
        throw new Error("Booking creation failed");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setPaymentError({
        field: "payment",
        code: "PAYMENT_FAILED",
        message: error instanceof Error ? error.message : "Booking failed",
      });
      setShowFailedModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleViewBooking = () => {
    setShowSuccessModal(false);
    router.push(`/customer/bookings/${bookingConfirmation?.bookingId}`);
  };

  const handleNewBooking = () => {
    setShowSuccessModal(false);
    router.push("/customer/search-result");
  };

  const handleRetryPayment = () => {
    setShowFailedModal(false);
    setPaymentError(null);
  };

  const handleTryDifferentMethod = () => {
    setShowFailedModal(false);
    setPaymentError(null);
    setCurrentStep("payment_method");
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "basic_info":
        return (
          <BasicInfoForm
            guestInfo={guestInfo}
            onBack={() => router.push("/customer/search-result")} // กลับไปหน้า search-result
            onNext={handleNext}
            disabled={loading}
            loading={loading}
          />
        );
      case "special_request":
        return (
          <SpecialRequestForm
            specialRequests={specialRequests}
            onSpecialRequestsChange={setSpecialRequests}
            additionalRequest={additionalRequest}
            onAdditionalRequestChange={setAdditionalRequest}
            onBack={handleBack} // กลับไปหน้า basic_info
            onNext={handleNext} // ไปหน้า payment_method
            disabled={loading}
            loading={loading}
          />
        );
      case "payment_method":
        return (
          <PaymentMethodForm
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            creditCardDetails={creditCardDetails}
            onCreditCardDetailsChange={setCreditCardDetails}
            promoCode={promoCode}
            onPromoCodeChange={setPromoCode}
            onPromoCodeApply={handlePromoCodeApply}
            promoCodeApplied={promoCodeApplied}
            promoDiscount={promoDiscount}
            onBack={handleBack} // กลับไปหน้า special_request
            onConfirm={handleConfirmBooking} // confirm booking
            disabled={loading}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <BookingLayout
        stepper={<BookingStepper currentStep={currentStep} steps={steps} />}
        sidebar={
          <div className="space-y-6">
            <BookingSummary
              roomInfo={roomInfo}
              checkIn={checkIn as string}
              checkOut={checkOut as string}
              guests={parseInt(guests as string)}
              calculation={calculation}
              specialRequests={selectedSpecialRequests.map((req) => ({
                name: req.name,
                price: req.price || 0,
              }))}
              promotionCode={
                promoCodeApplied
                  ? { code: promoCode, discount: promoDiscount }
                  : undefined
              }
              timeLeft={timeLeft}
            />
            <BookingPolicies />
          </div>
        }
      >
        {/* Form content เท่านั้น */}
        <div className="space-y-8">{renderStepContent()}</div>

        {/* Modals */}
        <PaymentSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          confirmation={bookingConfirmation!}
          guests={parseInt(guests as string)}
          paymentMethod={paymentMethod}
          onViewBooking={handleViewBooking}
          onNewBooking={handleNewBooking}
        />

        <PaymentFailedModal
          isOpen={showFailedModal}
          onClose={() => setShowFailedModal(false)}
          error={paymentError!}
          onRetry={handleRetryPayment}
          onTryDifferentMethod={handleTryDifferentMethod}
        />
      </BookingLayout>
    </Layout>
  );
}
