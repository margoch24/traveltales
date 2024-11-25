import { database } from "../public/scripts/main.js";
import { ref, set, push, update, remove, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

export class BaseModel {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.collectionRef = ref(database, this.collectionName);
    }

    create(data) {
        const newRef = push(this.collectionRef);
        return set(newRef, data)
            .then(() => ({ id: newRef.key, ...data }))
            .catch((error) => Promise.reject(error));
    }

    updateOne(id, data) {
        const itemRef = ref(database, `${this.collectionName}/${id}`);
        return update(itemRef, data)
            .then(() => ({ id, ...data }))
            .catch((error) => Promise.reject(error));
    }

    deleteOne(id) {
        const itemRef = ref(database, `${this.collectionName}/${id}`);
        return remove(itemRef)
            .then(() => ({ id }))
            .catch((error) => Promise.reject(error));
    }

    deleteMany(ids) {
        const updates = {};
        ids.forEach((id) => {
            updates[`${id}`] = null;
        });
        return update(this.collectionRef, updates)
            .then(() => ids)
            .catch((error) => Promise.reject(error));
    }

    findOne(id) {
        const itemRef = ref(database, `${this.collectionName}/${id}`);
        return get(itemRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    return { id, ...snapshot.val() };
                }
                return null;
            })
            .catch((error) => Promise.reject(error));
    }

    findMany(filterFn = null) {
        return get(this.collectionRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const items = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
                    return filterFn ? items.filter(filterFn) : items;
                }
                return [];
            })
            .catch((error) => Promise.reject(error));
    }
}
