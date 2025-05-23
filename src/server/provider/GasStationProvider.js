// src/providers/GasStationDataProvider.js
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";

const GasStationDataContext = createContext();

export const useGasStationData = () => useContext(GasStationDataContext);

export const GasStationDataProvider = ({ children }) => {
    const [gasStationData, setGasStationData] = useState({
        gasstation: {}
    });

    const [loading, setLoading] = useState(true);

    const refs = useMemo(() => ({
        gasstation: ref(database, "/depot/gasStations/")
    }), []);

    useEffect(() => {
        let loadedCount = 0;
        const totalRefs = Object.keys(refs).length;

        const unsubscribes = Object.entries(refs).map(([key, refItem]) =>
            onValue(refItem, snapshot => {
                setGasStationData(prev => ({
                    ...prev,
                    [key]: snapshot.val() || {}
                }));
                loadedCount++;
                if (loadedCount === totalRefs) {
                    setLoading(false); // ✅ ข้อมูลโหลดครบทุก path แล้ว
                }
            })
        );

        return () => unsubscribes.forEach(unsub => unsub());
    }, [refs]);

    return (
        <GasStationDataContext.Provider value={{ ...gasStationData, loading }}>
            {children}
        </GasStationDataContext.Provider>
    );
};
