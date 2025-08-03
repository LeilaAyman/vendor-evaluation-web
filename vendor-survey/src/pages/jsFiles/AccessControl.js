import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "../cssFiles/AccessControl.css"; // Optional styling 

function AccessControl() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        access: doc.data().access || { prerequisite: false, evaluation: false }
      }));
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  const toggleAccess = async (userId, key) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        const newAccess = {
          ...user.access,
          [key]: !user.access[key]
        };
        updateDoc(doc(db, "users", userId), { access: newAccess });
        return { ...user, access: newAccess };
      }
      return user;
    });
    setUsers(updatedUsers);
  };

  return (
    <div className="access-control-wrapper">
      <h2>👥 User Access Management</h2>
      <table className="access-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Legality Prerequisite Access</th>
            <th>Evaluation Access</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <input
                  type="checkbox"
                  checked={user.access.prerequisite}
                  onChange={() => toggleAccess(user.id, "prerequisite")}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={user.access.evaluation}
                  onChange={() => toggleAccess(user.id, "evaluation")}
                />
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AccessControl;
