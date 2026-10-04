// Get complaints from LocalStorage

let complaints =
    JSON.parse(localStorage.getItem("complaints")) || [];


// ===============================
// SUBMIT COMPLAINT
// ===============================

const form =
    document.getElementById("complaintForm");

if (form) {

    form.addEventListener("submit", function(event) {

        event.preventDefault();

        const complaint = {

            id: "CMP" + Date.now(),

            name:
                document.getElementById("name").value,

            email:
                document.getElementById("email").value,

            category:
                document.getElementById("category").value,

            title:
                document.getElementById("title").value,

            description:
                document.getElementById("description").value,

            status: "Pending",

            date:
                new Date().toLocaleDateString()

        };


        complaints.push(complaint);


        localStorage.setItem(
            "complaints",
            JSON.stringify(complaints)
        );


        // Save latest complaint ID

        localStorage.setItem(
            "latestComplaint",
            complaint.id
        );


        // Go to tracking page

        window.location.href =
            "track.html?id=" + complaint.id;

    });

}


// ===============================
// TRACK COMPLAINT
// ===============================

function trackComplaint() {

    const id =
        document.getElementById("complaintId").value.trim();

    const result =
        document.getElementById("trackingResult");


    const complaint =
        complaints.find(c => c.id === id);


    if (!complaint) {

        result.innerHTML = `
            <div class="complaint">
                <h3>Complaint Not Found</h3>
                <p>Please enter a valid Complaint ID.</p>
            </div>
        `;

        return;
    }


    let pendingClass = "";
    let reviewClass = "";
    let progressClass = "";
    let resolvedClass = "";


    if (complaint.status === "Pending") {

        pendingClass = "active";

    }

    else if (complaint.status === "Under Review") {

        pendingClass = "active";
        reviewClass = "active";

    }

    else if (complaint.status === "In Progress") {

        pendingClass = "active";
        reviewClass = "active";
        progressClass = "active";

    }

    else if (complaint.status === "Resolved") {

        pendingClass = "active";
        reviewClass = "active";
        progressClass = "active";
        resolvedClass = "active";

    }


    result.innerHTML = `

        <div class="complaint">

            <h3>${complaint.title}</h3>

            <p>
                <strong>Complaint ID:</strong>
                ${complaint.id}
            </p>

            <p>
                <strong>Category:</strong>
                ${complaint.category}
            </p>

            <p>
                <strong>Date:</strong>
                ${complaint.date}
            </p>

            <p>
                <strong>Current Status:</strong>
                ${complaint.status}
            </p>


            <div class="progress-box">

                <div class="progress-step ${pendingClass}">
                    ✓ Complaint Submitted
                </div>

                <div class="progress-step ${reviewClass}">
                    ${reviewClass ? "✓" : "○"}
                    Under Review
                </div>

                <div class="progress-step ${progressClass}">
                    ${progressClass ? "✓" : "○"}
                    In Progress
                </div>

                <div class="progress-step ${resolvedClass}">
                    ${resolvedClass ? "✓" : "○"}
                    Resolved
                </div>

            </div>

        </div>

    `;

}


// ===============================
// AUTO TRACK AFTER SUBMISSION
// ===============================

const params =
    new URLSearchParams(window.location.search);

const urlId =
    params.get("id");

if (urlId) {

    const input =
        document.getElementById("complaintId");

    if (input) {

        input.value = urlId;

        trackComplaint();

    }

}


// ===============================
// ADMIN DASHBOARD
// ===============================

function loadAdmin() {

    const list =
        document.getElementById("complaintList");

    if (!list) return;


    document.getElementById("total").innerText =
        complaints.length;


    document.getElementById("pending").innerText =
        complaints.filter(
            c => c.status === "Pending"
        ).length;


    document.getElementById("progress").innerText =
        complaints.filter(
            c => c.status === "In Progress"
        ).length;


    document.getElementById("resolved").innerText =
        complaints.filter(
            c => c.status === "Resolved"
        ).length;


    list.innerHTML = "";


    if (complaints.length === 0) {

        list.innerHTML =
            "<p>No complaints available.</p>";

        return;

    }


    complaints.forEach((complaint, index) => {

        list.innerHTML += `

            <div class="complaint">

                <h3>${complaint.title}</h3>

                <p>
                    <strong>ID:</strong>
                    ${complaint.id}
                </p>

                <p>
                    <strong>Name:</strong>
                    ${complaint.name}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${complaint.email}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${complaint.category}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${complaint.description}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${complaint.date}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${complaint.status}
                </p>


                <select
                    onchange="updateStatus(
                        ${index},
                        this.value
                    )">

                    <option
                        value="Pending"
                        ${complaint.status === "Pending"
                        ? "selected" : ""}>
                        Pending
                    </option>

                    <option
                        value="Under Review"
                        ${complaint.status === "Under Review"
                        ? "selected" : ""}>
                        Under Review
                    </option>

                    <option
                        value="In Progress"
                        ${complaint.status === "In Progress"
                        ? "selected" : ""}>
                        In Progress
                    </option>

                    <option
                        value="Resolved"
                        ${complaint.status === "Resolved"
                        ? "selected" : ""}>
                        Resolved
                    </option>

                </select>

            </div>

        `;

    });

}


// ===============================
// UPDATE STATUS
// ===============================

function updateStatus(index, newStatus) {

    complaints[index].status =
        newStatus;


    localStorage.setItem(
        "complaints",
        JSON.stringify(complaints)
    );


    loadAdmin();

}


// Load Admin Dashboard

loadAdmin();