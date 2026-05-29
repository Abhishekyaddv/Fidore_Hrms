<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Return a success JSON response.
     *
     * @param  mixed  $data
     * @param  string  $message
     * @param  int  $status
     * @return \Illuminate\Http\JsonResponse
     */
    protected function successResponse($data, string $message = null, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'status' => $status,
            'message' => $message,
            'data' => $data
        ], $status);
    }

    /**
     * Return an error JSON response.
     *
     * @param  string  $message
     * @param  int  $status
     * @param  mixed  $data
     * @return \Illuminate\Http\JsonResponse
     */
    protected function errorResponse(string $message, int $status = 400, $data = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'status' => $status,
            'message' => $message,
            'data' => $data
        ], $status);
    }
}
