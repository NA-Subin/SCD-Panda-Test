import { createContext, useContext, useEffect, useState } from "react";
import { get, onValue, ref } from "firebase/database";
import { database } from "./firebase";

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [data, setData] = useState({
        company: {},
        customer: {},
        officers: {},
        drivers: {},
        creditors: {},
        order: {},
        trip: {},
        tickets: {},
        reghead: {},
        regtail: {},
        small: {},
    });

    useEffect(() => {
        const refs = {
            company: ref(database, "/company"),
            customer: ref(database, "/customer"),
            officers: ref(database, "/employee/officers"),
            drivers: ref(database, "/employee/drivers"),
            creditors: ref(database, "/employee/creditors"),
            order: ref(database, "/order"),
            trip: ref(database, "/trip"),
            tickets: ref(database, "/tickets"),
            reghead: ref(database, "/truck/registration/"),
            regtail: ref(database, "/truck/registrationTail/"),
            small: ref(database, "/truck/small/"),
        };

        // โหลดข้อมูลครั้งแรก
        Promise.all(
            Object.entries(refs).map(([key, ref]) =>
                get(ref).then((snapshot) => [key, snapshot.val() || {}])
            )
        ).then((results) => {
            const initialData = Object.fromEntries(results);
            setData(initialData);

            // เริ่มฟังเรียลไทม์
            Object.entries(refs).forEach(([key, ref]) => {
                onValue(ref, (snapshot) => {
                    setData((prev) => ({ ...prev, [key]: snapshot.val() || {} }));
                });
            });
        });
    }, []);

    return (
        <DataContext.Provider value={data}>
            {data ? children : <div>Loading...</div>} {/* ✅ ป้องกัน `undefined` */}
        </DataContext.Provider>
    );
};
