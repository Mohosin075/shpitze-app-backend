import axios from "axios";
import config from "../config";

interface Location {
    coordinates: Number[];
}

const getDistanceFromOriginDestination = async (destinations: Location, origin: Location): Promise<number | null> => {
    const apiKey = config.google_maps;

    // Validate input
    if (!origin?.coordinates?.length || !destinations?.coordinates?.length) {
        return null;
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin?.coordinates[0]},${origin?.coordinates[1]}&destinations=${destinations?.coordinates[0]},${destinations?.coordinates[1]}&key=${apiKey}`;

    try {
        // Make API request
        const response = await axios.get(url);
        const data = response.data;

        // Check response structure and status
        if (
            data?.rows?.[0]?.elements?.[0]?.status === "OK" &&
            data.rows[0].elements[0].distance?.value
        ) {
            const distanceInMeters = data.rows[0].elements[0].distance.value;
            const distanceInKilometers = distanceInMeters / 1000; // Convert meters to kilometers
            return distanceInKilometers;
            
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};


export default getDistanceFromOriginDestination;