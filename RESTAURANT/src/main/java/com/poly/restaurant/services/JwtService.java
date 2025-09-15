package com.poly.restaurant.services;

import com.poly.restaurant.entities.AccountEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

	@Value("${application.security.jwt.secret-key}")
	private String secretKey;

	@Value("${application.security.jwt.expiration}")
	private long jwtExpiration;

	@Value("${application.security.jwt.refresh-token.expiration}")
	private long refreshTokenExpiration;

	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}

	public boolean isTokenValid(String token, AccountEntity account) {
		final String username = extractUsername(token);
		return (username.equals(account.getUsername())) && !isTokenExpired(token);
	}

	private boolean isTokenExpired(String token) {
		return extractExpiration(token).before(new Date());
	}

	private Date extractExpiration(String token) {
		return extractClaim(token, Claims::getExpiration);
	}

	public String generateToken(AccountEntity account) {
		return buildToken(account, jwtExpiration);
	}

	public String generateRefreshToken(AccountEntity account) {
		return buildToken(account, refreshTokenExpiration);
	}

	public String generateActivationToken(AccountEntity account) {
		// Activation token có thời hạn 7 ngày
		long activationExpiration = 7 * 24 * 60 * 60 * 1000; // 7 ngày
		return buildActivationToken(account, activationExpiration);
	}

	private String buildToken(AccountEntity account, long expiration) {
		Map<String, Object> extraClaims = new HashMap<>();

		String roleName = account.getRole() != null ? account.getRole().getName() : null;
		if (roleName != null) {
			extraClaims.put("role", roleName);
			System.out.println("JWT Token - Role added: " + roleName);
		} else {
			System.out.println("JWT Token - No role found for account: " + account.getUsername());
		}

		if (account.getBranch() != null) {
			extraClaims.put("branchId", account.getBranch().getId());
		}

		extraClaims.put("accountId", account.getId());

		System.out.println("JWT Token - Extra claims: " + extraClaims);

		return Jwts.builder().setClaims(extraClaims).setSubject(account.getUsername())
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + expiration))
				.signWith(getSignInKey(), SignatureAlgorithm.HS256).compact();
	}

	private String buildActivationToken(AccountEntity account, long expiration) {
		Map<String, Object> extraClaims = new HashMap<>();
		extraClaims.put("type", "activation");
		extraClaims.put("accountId", account.getId());
		extraClaims.put("email", account.getEmail());

		return Jwts.builder()
				.setClaims(extraClaims)
				.setSubject(account.getUsername())
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + expiration))
				.signWith(getSignInKey(), SignatureAlgorithm.HS256)
				.compact();
	}

	public Claims extractAllClaims(String token) {
		return Jwts.parserBuilder().setSigningKey(getSignInKey()).build().parseClaimsJws(token).getBody();
	}

	private Key getSignInKey() {
		byte[] keyBytes = Decoders.BASE64.decode(secretKey);
		return Keys.hmacShaKeyFor(keyBytes);
	}
}
