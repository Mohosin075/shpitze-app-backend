interface LocationData {
    user: string;
    latitude: number;
    longitude: number;
    active: boolean;
}

const socketLocationHelper = () => {
    // Ensure global.io is initialized

    //@ts-ignore
    const socketIo = global.io;

    // Update the location and store the latest data in the Map
    socketIo.on('updateLocation', (locationData: LocationData) => {
        // Optionally validate locationData here

        console.log(locationData);
        
        // Emit the location data to all connected clients
        socketIo.emit('watch', locationData);
    });
}

export default socketLocationHelper;