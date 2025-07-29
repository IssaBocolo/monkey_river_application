import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Mock react-router's useNavigate
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn()
}));

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockNavigate = jest.fn();
(useNavigate as jest.Mock).mockReturnValue(mockNavigate);

describe("Login component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("logs in and redirects", async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { token: "fake-jwt-token" } });

        render(<Login />);
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: "password" },
        });
        fireEvent.click(screen.getByText(/login/i));

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard"));
        expect(localStorage.getItem("token")).toBe("fake-jwt-token");
    });

    test("shows error on failed login", async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error("Login failed"));

        render(<Login />);
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: "wrong@example.com" },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: "wrongpassword" },
        });
        fireEvent.click(screen.getByText(/login/i));

        await waitFor(() => {
            expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
        });
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
