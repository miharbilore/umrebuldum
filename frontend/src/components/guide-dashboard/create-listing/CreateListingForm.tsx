"use client";

import { Button } from "@/components/ui/button";
import { useCategories } from "./useCategories";
import { useDepartureCities } from "./useDepartureCities";
import { useCreateListing } from "./useCreateListing";
import { BasicDetailsSection } from "./BasicDetailsSection";
import { ImageUploadSection } from "./ImageUploadSection";
import { LocationAndPriceSection } from "./LocationAndPriceSection";

export function CreateListingForm() {
    const { categories, loading: catsLoading } = useCategories();
    const { departureCities, loading: citiesLoading } = useDepartureCities();
    const { state, handleSubmit } = useCreateListing();

    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <h3 className="font-bold mb-4">Yeni Tur Oluştur</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <BasicDetailsSection 
                    title={state.title}
                    setTitle={state.setTitle}
                    category={state.category}
                    handleCategoryChange={state.handleCategoryChange}
                    categories={categories}
                />

                <ImageUploadSection 
                    category={state.category}
                    selectedPredefinedImage={state.selectedPredefinedImage}
                    setSelectedPredefinedImage={state.setSelectedPredefinedImage}
                    customImagePreview={state.customImagePreview}
                    setCustomImagePreview={state.setCustomImagePreview}
                    setCustomImageFile={state.setCustomImageFile}
                />

                <LocationAndPriceSection 
                    departureCity={state.departureCity}
                    setDepartureCity={state.setDepartureCity}
                    departureCities={departureCities}
                    city={state.city}
                    setCity={state.setCity}
                    meetingCity={state.meetingCity}
                    setMeetingCity={state.setMeetingCity}
                    price={state.price}
                    setPrice={state.setPrice}
                    hotelName={state.hotelName}
                    setHotelName={state.setHotelName}
                    airline={state.airline}
                    setAirline={state.setAirline}
                    quota={state.quota}
                    setQuota={state.setQuota}
                    extraServices={state.extraServices}
                    toggleService={state.toggleService}
                />

                <Button type="submit" disabled={state.loading || catsLoading || citiesLoading} className="w-full min-h-11 font-bold">
                    {state.loading ? "Oluşturuluyor..." : "İlanı Yayınla"}
                </Button>
            </form>
        </div>
    );
}
