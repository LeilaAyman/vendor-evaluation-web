import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  Tooltip,
} from "@mui/material";
import { green, red, grey, blue } from "@mui/material/colors";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const MAX_SCORES = {
  finance: 30,
  both: 10,
  IT: 50,
};

function NewVendorsStatus() {
  const [approvedVendors, setApprovedVendors] = useState([]);
  const [discardedVendors, setDiscardedVendors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const vendorsSnapshot = await getDocs(collection(db, "vendors"));
      const evaluationsSnapshot = await getDocs(collection(db, "evaluations"));
      const discardedSnapshot = await getDocs(
        collection(db, "discarded_new_vendors")
      );

      // Cache user info to avoid redundant fetching
      const userSnapshot = await getDocs(collection(db, "users"));
      const userMap = {};
      userSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        userMap[data.uid] = data.name;
      });

      const discarded = discardedSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          discardedByName: userMap[data.discardedBy] || "Unknown",
        };
      });

      setDiscardedVendors(discarded);

      const evalMap = {};
      evaluationsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const name = data.vendorName?.trim();
        if (!name) return;
        if (!evalMap[name]) evalMap[name] = { finance: [], both: [], IT: [] };

        const { totalScores = {} } = data;
        if (typeof totalScores.finance === "number")
          evalMap[name].finance.push(totalScores.finance);
        if (typeof totalScores.both === "number")
          evalMap[name].both.push(totalScores.both);
        if (typeof totalScores.IT === "number")
          evalMap[name].IT.push(totalScores.IT);
      });

      const approved = vendorsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((v) => v.new === true && v.discarded !== true)
        .map((vendor) => {
          const scores = evalMap[vendor.name] || {
            finance: [],
            both: [],
            IT: [],
          };
          const avg = (arr) =>
            arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
          const norm = (score, max) =>
            score > 0 ? ((score / max) * 100).toFixed(2) : "0.00";

          const finance = norm(avg(scores.finance), MAX_SCORES.finance);
          const both = norm(avg(scores.both), MAX_SCORES.both);
          const it = norm(avg(scores.IT), MAX_SCORES.IT);

          const total = [finance, both, it].map(Number).filter((v) => v > 0);
          const totalScore =
            total.length > 0
              ? (total.reduce((a, b) => a + b, 0) / total.length).toFixed(2)
              : "0.00";

          return {
            name: vendor.name,
            totalScore,
            finance,
            both,
            it,
          };
        });

      setApprovedVendors(approved);
    };

    fetchData();
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        padding: 4,
        borderRadius: 4,
        boxShadow: 3,
        maxWidth: "1200px",
        margin: "auto",
        mt: 4,
        mb: 6,
      }}
    >
      {/* Approved Section */}
      <Divider sx={{ my: 4 }}>
        <Typography variant="h6" fontWeight="bold" color={green[700]}>
          New Vendors current scores 
        </Typography>
      </Divider>

      {
        <Grid container spacing={3}>
          {approvedVendors.length > 0 ? (
            approvedVendors.map((vendor, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  variant="outlined"
                  sx={{ borderLeft: `6px solid ${green[500]}` }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      
                      <Typography variant="h6">{vendor.name}</Typography>
                    </Box>
                    <Chip
                      label={`Total Score: ${vendor.totalScore}%`}
                      sx={{ bgcolor: blue[50], color: blue[700], mb: 1 }}
                    />
                    <Box display="flex" justifyContent="space-between">
                      <Chip
                        label={`Finance: ${vendor.finance}%`}
                        color="info"
                        variant="outlined"
                      />
                      <Chip
                        label={`Both: ${vendor.both}%`}
                        color="secondary"
                        variant="outlined"
                      />
                      <Chip
                        label={`IT: ${vendor.it}%`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography sx={{ margin: 2 }}>No approved new vendors.</Typography>
          )}
        </Grid>
      }

      {/* Discarded Section */}
      <Divider sx={{ my: 4 }}>
        <Typography variant="h6" fontWeight="bold" color={red[700]}>
          Discarded Vendors (Legal Issues)
        </Typography>
      </Divider>

      {
        <Grid container spacing={3}>
          {discardedVendors.length > 0 ? (
            discardedVendors.map((vendor, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  variant="outlined"
                  sx={{ borderLeft: `6px solid ${red[500]}` }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Avatar sx={{ bgcolor: red[500] }}>
                        <CancelIcon />
                      </Avatar>
                      <Typography variant="h6">{vendor.vendorName}</Typography>
                    </Box>
                    <Typography variant="body2" color={grey[800]}>
                      Reason: {vendor.reason}
                    </Typography>
                    <Typography variant="body2" color={grey[700]}>
                      Discarded by: {vendor.discardedByName}
                    </Typography>
                    <Typography variant="body2" color={grey[600]}>
                      Date:{" "}
                      {new Date(
                        vendor.discardedAt?.seconds * 1000
                      ).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography sx={{ margin: 2 }}>No discarded vendors.</Typography>
          )}
        </Grid>
      }
    </Box>
  );
}

export default NewVendorsStatus;
