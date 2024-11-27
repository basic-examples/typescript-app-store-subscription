//
//  ContentView.swift
//  test241121
//

import SwiftUI
import StoreKit

struct ContentView: View {
    @State private var isPurchasing = false
    @State private var products: [Product] = []
    @State private var purchaseMessage: String = ""

    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hello, world!")

            if let consumableProduct = products.first(where: { $0.id == "test.consumable" }) {
                Button(action: {
                    purchaseConsumable(consumableProduct)
                }) {
                    Text(isPurchasing ? "Purchasing..." : "Buy Consumable")
                        .bold()
                }
                .disabled(isPurchasing)
            } else {
                Text("Loading products...")
            }

            if !purchaseMessage.isEmpty {
                Text(purchaseMessage)
                    .foregroundColor(.green)
                    .padding()
            }
        }
        .padding()
        .task {
            await fetchProducts()
        }
    }

    private func fetchProducts() async {
        do {
            let storeProducts = try await Product.products(for: ["test.consumable"])
            products = storeProducts
        } catch {
            print("Failed to fetch products: \(error.localizedDescription)")
        }
    }

    private func purchaseConsumable(_ product: Product) {
        isPurchasing = true
        Task {
            do {
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    if case .verified = verification {
                        purchaseMessage = "Purchase successful!"
                        print("Purchase successful and verified.")
                        // Deliver consumable content here
                    } else {
                        purchaseMessage = "Purchase verification failed."
                        print("Verification failed.")
                    }
                case .userCancelled:
                    purchaseMessage = "Purchase cancelled."
                    print("User cancelled the purchase.")
                case .pending:
                    purchaseMessage = "Purchase pending."
                    print("Purchase is pending.")
                @unknown default:
                    purchaseMessage = "Unknown purchase result."
                    print("Unknown purchase result.")
                }
            } catch {
                purchaseMessage = "Purchase failed: \(error.localizedDescription)"
                print("Purchase failed: \(error.localizedDescription)")
            }
            isPurchasing = false
        }
    }
}

#Preview {
    ContentView()
}
